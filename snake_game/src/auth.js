export class Auth {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.onAuthStateChange = null;
    }

    loadUsers() {
        try {
            const users = localStorage.getItem('snakeUsers');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('加载用户数据失败:', error);
            return [];
        }
    }

    saveUsers() {
        localStorage.setItem('snakeUsers', JSON.stringify(this.users));
    }

    enterGame(username) {
        username = username.trim();

        if (!username) {
            throw new Error('用户名不能为空');
        }

        if (username.length < 2 || username.length > 20) {
            throw new Error('用户名长度必须在2-20个字符之间');
        }

        let user = this.users.find(user => user.username.toLowerCase() === username.toLowerCase());

        if (!user) {
            user = {
                username,
                highScores: [],
                createdAt: new Date().toISOString()
            };
            this.users.push(user);
            this.saveUsers();
        }

        this.currentUser = user;
        if (this.onAuthStateChange) {
            this.onAuthStateChange(user);
        }
    }

    logout() {
        this.currentUser = null;
        if (this.onAuthStateChange) {
            this.onAuthStateChange(null);
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    saveHighScore(score) {
        if (!this.currentUser) return;

        this.currentUser.highScores.push(score);
        this.currentUser.highScores.sort((a, b) => b - a);
        this.currentUser.highScores = this.currentUser.highScores.slice(0, 10);

        const userIndex = this.users.findIndex(user => user.username === this.currentUser.username);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            this.saveUsers();
        }
    }

    getAllHighScores() {
        const allScores = this.users.reduce((scores, user) => {
            user.highScores.forEach(score => {
                scores.push({
                    username: user.username,
                    score: score
                });
            });
            return scores;
        }, []);

        return allScores.sort((a, b) => b.score - a.score).slice(0, 10);
    }
}