const watch = async client => {
  const watcher = await client
    .watch()
    .prefix('')
    .create();

  const putHandler = kv => console.log(`PUT ${kv.key.toString()} = ${kv.value.toString()}`);
  watcher.on('put', putHandler);

  const delHandler = kv => console.log(`DEL ${kv.key.toString()}`);
  watcher.on('del', delHandler);

  const handle = async () => {
    await watcher.cancel();
    client.close();
  };

  process.on('SIGINT', handle);
  process.on('SIGTERM', handle);

  return new Promise(resolve => watcher.once('end', resolve));
};

export default watch;
