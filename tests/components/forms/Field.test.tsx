import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Field, FormMessage } from "@/components/forms/Field";

describe("Field", () => {
  it("labels the control by id and name, with the label outside the control", () => {
    const html = renderToStaticMarkup(<Field id="name" label="Name">{(p) => <input {...p} />}</Field>);
    expect(html).toBe('<div><label for="name">Name</label><input id="name" name="name"/></div>');
  });

  it("links a hint with aria-describedby", () => {
    const html = renderToStaticMarkup(<Field id="model" label="Model" hint="Which one?">{(p) => <input {...p} />}</Field>);
    expect(html).toMatch(/<input id="model"[^>]*aria-describedby="model-help"/);
    expect(html).toContain('<small id="model-help">Which one?</small>');
  });

  it("marks the control invalid and shows the error instead of the hint", () => {
    const html = renderToStaticMarkup(
      <Field id="name" label="Name" hint="hint" error="Name, please.">{(p) => <input {...p} />}</Field>,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('<small id="name-help">Name, please.</small>');
    expect(html).not.toContain("hint");
  });
});

describe("FormMessage", () => {
  it("renders nothing without a message", () => {
    expect(renderToStaticMarkup(<FormMessage ok={false} />)).toBe("");
  });

  it("announces success as a status and errors as an alert", () => {
    expect(renderToStaticMarkup(<FormMessage ok message="Done" />)).toBe('<p role="status" class="form-success">Done</p>');
    expect(renderToStaticMarkup(<FormMessage ok={false} message="Oops" />)).toBe('<p role="alert" class="form-error">Oops</p>');
  });
});

describe("Field accessible name", () => {
  it("keeps the hint out of the label, so the control's name is just the label", () => {
    const html = renderToStaticMarkup(<Field id="name" label="Ailment" hint="For example">{(p) => <input {...p} />}</Field>);
    expect(html).toContain('<label for="name">Ailment</label>');
  });
});
