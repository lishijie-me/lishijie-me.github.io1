import { Link } from 'react-router-dom';
import YearlyGoals from '../components/YearlyGoals';

export default function About() {
    return (
        <div className="about">
            <div className="about-header">
                <img
                    className="avatar"
                    src="/images/avatar.jpg"
                    alt="头像"
                    onError={(e) => {
                        // 没有头像时隐藏，避免裂图
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <div>
                    <h1>关于我</h1>
                    <p className="about-sub">一个爱写代码的人</p>
                </div>
            </div>

            <section className="about-section">
                <h2>简介</h2>
                <p>
                    你好，我是 <strong>你的名字</strong>，目前在做 全栈开发。
                    平时喜欢折腾各种工具，写点东西记录踩过的坑。
                </p>
            </section>

            <section className="about-section">
                <h2>技能</h2>
                <ul className="skill-list">
                    <li>JavaScript / TypeScript</li>
                    <li>React / Vue</li>
                    <li>Node.js</li>
                    <li>Git / CI</li>
                </ul>
            </section>

            <section className="about-section">
                <h2>联系我</h2>
                <ul className="contact-list">
                    <li>
                        GitHub：
                        <a href="https://github.com/你的用户名" target="_blank" rel="noreferrer">
                            @你的用户名
                        </a>
                    </li>
                    <li>
                        邮箱：
                        <a href="mailto:you@example.com">you@example.com</a>
                    </li>
                </ul>
            </section>
            <section className="about-section">
                <YearlyGoals />
            </section>
            <p className="back">
                <Link to="/">← 返回首页</Link>
            </p>
        </div>
    );
}