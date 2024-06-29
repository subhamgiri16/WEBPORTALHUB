// GET all users
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching users:', err);
          res.status(500).send('Error fetching users data');
          return;
      }
      res.json(results); // Send JSON response with fetched users data
  });
});