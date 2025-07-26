import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Run the app
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root')
});