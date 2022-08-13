import { supabase } from "./supabaseClient";
import { Message } from "../types/common";

export const downloadImage = async (
  path: string,
  setMessage: (message: Message) => void
) => {
  // アバター画像をダウンロード（ストレージから）
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(path);
    if (error) {
      throw error;
    }
    return URL.createObjectURL(data);
  } catch (error) {
    setMessage({
      severity: "error",
      text: `アバター画像のダウンロードに失敗しました : ${
        error.error_description || error.message
      }`,
    });
  }
};

export const listImages = async (setMessage: (message: Message) => void) => {
  // アバター画像の一覧を取得（ストレージから）
  try {
    const { data, error } = await supabase.storage.from("avatars").list();
    if (error) {
      throw error;
    }
    let urls: string[] = [];
    data?.forEach((file) => {
      if (file.name !== "") {
        urls.push(file.name);
      }
    });
    return urls;
  } catch (error) {
    setMessage({
      severity: "error",
      text: `アバター画像一覧の取得に失敗しました : ${
        error.error_description || error.message
      }`,
    });
  }
};
