function useLocalStore() {
  const uri = process.env.MONGO_URI;
  return !uri || uri === "your_mongodb_connection_string";
}

module.exports = { useLocalStore };
