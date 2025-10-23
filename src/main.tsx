import '@ant-design/v5-patch-for-react-19';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'antd/dist/reset.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'

// 抑制 Monaco 加载器在卸载/切换时的取消异常噪音
window.addEventListener('unhandledrejection', (event) => {
  const r: any = event.reason;
  const msg: string = (r && (r.msg || r.message)) || '';
  const type: string | undefined = r && r.type;
  if (type === 'cancelation' || /cancel/i.test(msg) || r?.name === 'Canceled') {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
