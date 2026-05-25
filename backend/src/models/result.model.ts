import mongoose, { Schema, Document } from "mongoose";
import { IResult } from "../types/index.js";

export interface IResultDoc extends Omit<IResult, "id">, Document {}

const QuestionSchema = new Schema({
  question_text: { type: String, required: true },
  question_type: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Moderate", "Hard"], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema({
  section_name: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const ResultSchema = new Schema(
  {
    assignment_id: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    sections: [SectionSchema],
    pdf_url: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

ResultSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Result = mongoose.model<IResultDoc>("Result", ResultSchema);
