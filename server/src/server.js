const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // <-- ADD { alter: true } HERE

    console.log("✅ Database Connected");

    app.listen(config.port, () => {
      console.log(`🚀 Server running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error(err);
  }
};
