// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  query,
  collection,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA6xoocEJsVI5i4EPe6XUn2FTlQEdRfYI",
  authDomain: "mock-gps-31238.firebaseapp.com",
  projectId: "mock-gps-31238",
  storageBucket: "mock-gps-31238.appspot.com",
  messagingSenderId: "927853684183",
  appId: "1:927853684183:web:da91ec3d30c4e3fa991792",
  measurementId: "G-ZMDKQ9X51X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth();

export async function writeGeoData(busNumber) {
  if (auth.currentUser) {
    try {
      const geo = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          () => "位置情報の取得に失敗しました"
        );
      });

      const id = new Date().getTime();

      // Firestoreのドキュメントを設定します
      // コレクション'bus' -> ドキュメント'${busNumber}' -> コレクション'geo_data' -> ドキュメント'${current DateTime}'
      await setDoc(
        doc(db, "bus", `${busNumber}`, "geo_data", id.toString()),
        {
          y: geo.coords.latitude, // 緯度
          x: geo.coords.longitude, // 経度
          c: id,
          b: busNumber,
        },
        {
          merge: true, // 既存のドキュメントにマージする（フィールドが存在しない場合は新規作成）
        }
      );
      console.log(`bus_${busNumber} へのデータの追加/更新に成功しました。`);
    } catch (error) {
      console.error(
        `bus_${busNumber}  へのデータの追加/更新に失敗しました:`,
        error
      );
      throw error;
    }
  } else {
    throw new Error(
      "認証されていないユーザーによる書き込みは許可されていません。"
    );
  }
}

export async function loginWithEmailPassword(email, password) {
  return await new Promise((resolve, reject) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // メールアドレスとパスワードでのログインが成功した場合の処理
        const user = userCredential.user;
        resolve(user);
      })
      .catch((error) => {
        // ログイン処理に失敗した場合の処理
        console.error("ログインに失敗しました:", error);
        reject(error);
      });
  });
}

export async function readGeoDataset(busNumber, maxCount = 10) {
  const q = query(
    collection(db, "bus", `${busNumber}`, "geo_data"),
    orderBy("c", "desc"),
    limit(maxCount)
  );
  const querySnapshot = await getDocs(q);
  const dataset = [];

  querySnapshot.forEach((doc) => {
    dataset.push(doc.data());
  });
  return dataset;
}

export function runReader(
  busNumber,
  callback,
  maxCount = 10,
  interval = 30000
) {
  let job = null;
  const update = async () => {
    try {
      const q = query(
        collection(db, "bus", `${busNumber}`, "geo_data"),
        orderBy("c", "desc"),
        limit(maxCount)
      );
      const querySnapshot = await getDocs(q);
      const dataset = [];

      querySnapshot.forEach((doc) => {
        dataset.push(doc.data());
      });
      if (dataset.length !== 0) {
        callback(dataset);
      }
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
      clearInterval(job);
    }
  };

  update();
  job = setInterval(update, interval);
  return job;
}

export function runWriter(busNumber, interval = 30000) {
  let job = null;
  const update = async () => {
    try {
      writeGeoData(busNumber);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
      clearInterval(job);
    }
  };

  update();
  job = setInterval(update, interval);
  return job;
}

// =============== 以下、テスト用関数 ======================================================================================================

/** この関数はGoogleアカウントでログインするときに使用するので、今回は不要 */
export async function loginGoogle() {
  return await new Promise((resolve, reject) => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // Googleアカウントでのログインが成功した場合の処理
        const user = result.user;
        resolve(user);
      })
      .catch((error) => {
        // ログイン処理に失敗した場合の処理
        console.error("ログインに失敗しました:", error);
        reject(error);
      });
  });
}

/**
 * Firebaseのルールで新たなユーザーをSDKから作成できないように制御しているので、この関数はテスト用
 */
export async function createWithEmailPassword(email, password) {
  return await new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // メールアドレスとパスワードでのログインが成功した場合の処理
        const user = userCredential.user;
        resolve(user);
      })
      .catch((error) => {
        // ログイン処理に失敗した場合の処理
        console.error("ログインに失敗しました:", error);
        reject(error);
      });
  });
}
