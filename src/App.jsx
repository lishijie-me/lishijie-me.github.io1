import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';
import About from './pages/About';
import './styles.css';

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="site-header">
          <Link to="/" className="logo">我想写点什么</Link>
          <nav className="nav">
            <Link to="/">首页</Link>
            <Link to="/about">关于</Link>
          </nav>
        </header>

        <main className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <footer className="site-footer">
          © 2026-{new Date().getFullYear()} fake it till you make it
        </footer>
      </div>
    </HashRouter>
  );
}