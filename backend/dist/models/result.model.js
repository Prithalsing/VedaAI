import mongoose, { Schema } from "mongoose";
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
const ResultSchema = new Schema({
    assignment_id: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    sections: [SectionSchema],
    pdf_url: { type: String },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
ResultSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const Result = mongoose.model("Result", ResultSchema);
