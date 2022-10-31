/* eslint-disable linebreak-style */
import {Response} from "express";

const addEntry = async (req: Request, res: Response) => {
  console.log("asd");
  res.send("hello");
  res.status(404).json({message: "there was an error"});
  return null;
};

export {addEntry};
