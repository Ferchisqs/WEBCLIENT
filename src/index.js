import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Card, Avatar, Input, Typography } from 'antd';
import '../src/index.css';

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

const client = new W3CWebSocket('ws://127.0.0.1:8000');

class App extends Component {
  state = {
    userName: '',
    isLoggedIn: false,
    messages: [],
    notifications: [],
    searchVal: '',
  };



 

  componentDidMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    client.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    client.onclose = () => {
      console.log('WebSocket Connection Closed');
    };

    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log('Received message from server:', dataFromServer);

      if (dataFromServer.type === 'message') {
        this.setState((state) => ({
          messages: [...state.messages, { msg: dataFromServer.msg, user: dataFromServer.user }],
        }));
      } else if (dataFromServer.type === 'notification') {
        console.log('Received Notification:', dataFromServer.message);
        this.setState((state) => ({
          notifications: [...state.notifications, { message: dataFromServer.message }],
        }));
      }
    };
  }

  onButtonClicked = (value) => {
    client.send(
      JSON.stringify({
        type: 'message',
        msg: value,
        user: this.state.userName,
      })
    );

    this.setState((prevState) => ({
      searchVal: '',
      messages: [...prevState.messages, { msg: value, user: this.state.userName }],
    }));
  };

  render() {
     const ObtenerNotification =  async()=> {
      try {
       const rest = await fetch ("http://localhost:8000/notificacion/new")
       const data = await rest.json();
      } catch (error) {
        console.log(error)
      }
      finally{
       this.ObtenerNotification()
      }
     }
   
     async function crearNoti(id) {
      let data = {
        id: id
      };
      try {
        const rest = await fetch(`http://localhost:8000/notificacion/crear/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
    
        const notificationData = await rest.json();
        this.setState((state) => ({
          notifications: [...state.notifications, { message: notificationData.message }],
        }));
    
      } catch (error) {
        console.log(error)
      }
    }
    
    return (
      <div className="main" id="wrapper">
        {this.state.isLoggedIn ? (
          <div>
            <div className="title">
              <Text id="main-heading" type="secondary" style={{ fontSize: '36px' }}>
                Welcome Again: {this.state.userName}
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50 }} id="messages">
              {this.state.messages.map((message) => (
                <Card
                  key={message.msg}
                  style={{
                    width: 300,
                    margin: '16px 4px 0 4px',
                    alignSelf: this.state.userName === message.user ? 'flex-end' : 'flex-start',
                  }}
                  loading={false}
                >
                  <Meta
                    avatar={
                      <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
                        {message.user[0].toUpperCase()}
                      </Avatar>
                    }
                    title={`${message.user}:`}
                    description={message.msg}
                  />
                </Card>
              ))}
              {this.state.notifications.map((notification, index) => (
                <div key={index} className="notification">
                  {notification.message}
                </div>
              ))}
            </div>

            <div className="bottom">
              <Search 
                onClick={() => crearNoti(this.state.userName)} 
                placeholder="input message and send"
                enterButton="Send"
                value={this.state.searchVal}
                size="large"
                onChange={(e) => this.setState({ searchVal: e.target.value })}
                onSearch={(value) => this.onButtonClicked(value)}
              />
            </div>
          </div>
        ) : (
          <div style={{ padding: '200px 40px' }}>
            <Search
              placeholder="Enter Username"
              enterButton="Login"
              size="large"
              onSearch={(value) => this.setState({ isLoggedIn: true, userName: value })}
            />
          </div>
        )}
      </div>
    );
  }
}


ReactDOM.render(<App />, document.getElementById('root'));
