import mongoose, { Schema } from "mongoose";
const AssignmentSchema = new Schema({
    due_date: { type: Date, required: true },
    question_types: { type: [String], required: true },
    number_of_questions: { type: Number, required: true },
    total_marks: { type: Number, required: true },
    question_configs: {
        type: [
            {
                question_type: { type: String, required: true },
                number_of_questions: { type: Number, required: true },
                marks_per_question: { type: Number, required: true },
            },
        ],
        default: undefined,
    },
    additional_instructions: { type: String },
    reference_text: { type: String },
    assignment_title: { type: String },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
        required: true,
    },
    generated_paper_id: { type: Schema.Types.ObjectId, ref: "Result" },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});
AssignmentSchema.set("toJSON", {
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});
export const Assignment = mongoose.model("Assignment", AssignmentSchema);
