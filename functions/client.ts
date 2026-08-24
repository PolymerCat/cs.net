import Pocketbase from "pocketbase";

const pb = new Pocketbase(process.env.NEXT_PUBLIC_DB_CONNECT);

export default pb;