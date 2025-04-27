const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const groupsRouter = require('./routes/groups');

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/groups', groupsRouter); 