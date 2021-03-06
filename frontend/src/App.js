import React from 'react';
import axios from 'axios';
import {
  Layout,
  Menu,
  Icon
} from 'antd';
import 'antd/dist/antd.css';
import './App.css';
import ILPLogo from './logo.png';
import ConnectorContent from './ConnectorContent';
import About from './About';

const {
  Header, Content, Sider,
} = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeConnectorStats: 0 };
  }

  componentDidMount() {
    this.loadConnectors();
  }

  async loadConnectors() {
    const promise = await axios.get('/routing');
    const connectors = promise.data;
    const routes = await Promise.all(connectors.map(async (destinationMap) => {
      const promise = await axios.post('/pingroute', {
        destination: destinationMap.address,
        numPing: 4
      });
      return {
        "address": promise.data.address,
        "stats": promise.data.stats,
        "path": destinationMap.path
      };
    }));
    console.log(routes);
    this.setState({ routes: routes });
  }

  displayConnectorStats = item => {
    this.setState({ activeConnectorStats: parseInt(item.key) });
  }

  render() {
    let displayContent;
    if (this.state.routes) {
      const connectors = this.state.routes.map((routeInfo, i) => {

        let status;
        if (routeInfo.stats.loss === 0) {
          status = "green";
        } else if (routeInfo.stats.loss === 1) {
          status = "red";
        } else {
          status = "yellow";
        }

        return (
          <Menu.Item
            key={i}
            onClick={this.displayConnectorStats}
          >
            <Icon type="laptop"
              style={{
                color: status,
                fontSize: '28px',
                float: "left"
              }}
            />
            <span className="nav-text">{routeInfo.address}</span>
					</Menu.Item>
        );
      });

      const connectorInfo = this.state.routes[this.state.activeConnectorStats];

      displayContent = (
        <Layout>
          <Sider id="app-sider" width="auto">
            <Menu
              mode="inline"
              defaultSelectedKeys={['0']}
            >
              {connectors}
            </Menu>
          </Sider>
          <Content id="app-content">
            <ConnectorContent
              address={connectorInfo.address}
              stats={connectorInfo.stats}
              path={connectorInfo.path}
            />
          </Content>
        </Layout>
      );

    } else {
      displayContent = <Icon type="loading" />;
    }

    return (
      <div>
        <Layout>
          <Header id="app-header">
            <img id="ILPLogo" alt="Interledger" src={ILPLogo} />
            <span id="app-title">ILP Monitor</span>
            <About />
          </Header>
          {displayContent}
        </Layout>
      </div>
    );
  }
}

export default App;
