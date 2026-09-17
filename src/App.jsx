import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Post from './pages/Post';
import './styles.css';

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="site-header">
          <Link to="/" className="logo">我的博客</Link>
          <nav>
            <Link to="/">首页</Link>
          </nav>
        </header>

        <main className="site-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<Post />} />
          </Routes>
        </main>

        <footer className="site-footer">
          © {new Date().getFullYear()} 我的博客
        </footer>
      </div>
    </HashRouter>
  );
}