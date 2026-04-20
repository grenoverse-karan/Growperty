import Pocketbase from 'pocketbase';

const POCKETBASE_API_URL = "https://growperty-pocketbase.onrender.com";

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
