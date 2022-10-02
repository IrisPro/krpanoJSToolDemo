import Vue, {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import useThrottleDriective from './utils/throttle'
import 'element-plus/dist/index.css'

function setupApp() {
    const app = createApp(App)
    useThrottleDriective(app)
    app.mount('#app')
}

setupApp()
