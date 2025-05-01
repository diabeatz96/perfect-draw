import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawKeyword extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.id = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Keyword.id"
    }); // Unique identifier

    schema.name = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Keyword.name"
    }); // Keyword name

    schema.category = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Keyword.category"
    }); // Keyword category

    schema.source_book = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Keyword.source_book"
    }); // Source publication

    schema.description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Keyword.description"
    }); // Brief summary

    schema.detailed_rules = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Keyword.detailed_rules"
    }); // Detailed explanation (optional)

    schema.custom_card_costing_guidance = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Keyword.custom_card_costing_guidance"
    }); // Costing guidance (optional)

    schema.notes_for_judge = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Keyword.notes_for_judge"
    }); // Judge notes (optional)

    return schema;
  }

}