import { describe, expect, it } from "vitest";
import { validateTaskField, validateTaskInput } from "./taskValidation";

describe("task validation", () => {
  it("rejects an empty title", () => {
    expect(validateTaskField("title", "")).toBe("عنوان الزامی است.");
  });

  it("rejects a whitespace-only title", () => {
    expect(validateTaskField("title", "   ")).toBe("عنوان الزامی است.");
  });

  it("rejects a title shorter than three characters", () => {
    expect(validateTaskField("title", "ab")).toBe("عنوان باید حداقل ۳ کاراکتر باشد.");
  });

  it("rejects a title longer than one hundred characters", () => {
    expect(validateTaskField("title", "a".repeat(101))).toBe("عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.");
  });

  it("rejects invalid descriptions", () => {
    expect(validateTaskField("description", "  ")).toBe("توضیحات الزامی است.");
    expect(validateTaskField("description", "ab")).toBe("توضیحات باید حداقل ۳ کاراکتر باشد.");
    expect(validateTaskField("description", "a".repeat(501))).toBe("توضیحات نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد.");
  });

  it("rejects an invalid status", () => {
    expect(validateTaskField("status", "blocked")).toBe("لطفاً یک وضعیت معتبر انتخاب کنید.");
  });

  it("rejects an invalid priority", () => {
    expect(validateTaskField("priority", "urgent")).toBe("لطفاً یک اولویت معتبر انتخاب کنید.");
  });

  it("accepts a fully valid input", () => {
    expect(validateTaskInput({ title: "Valid task", description: "Valid description", status: "todo", priority: "medium" })).toEqual({});
  });
});
