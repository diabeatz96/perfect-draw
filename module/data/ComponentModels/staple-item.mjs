import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawStaple extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.name = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Staple.name",
      initial: "New Staple"
    }); // Staple name

    schema.type = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Staple.type",
      initial: "generic",
    }); // 'Generic' or 'Playbook'

    schema.source_playbook_id = new fields.StringField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Staple.source_playbook_id"
    }); // Playbook reference (optional)

    schema.keywords = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Staple.keywords.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Staple.keywords" }
    ); // Associated keywords

    schema.limitations = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Staple.limitations.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Staple.limitations" }
    ); // Usage restrictions

    schema.energy_cost_equivalent = new fields.NumberField({
      required: true,
      label: "PERFECT_DRAW.Staple.energy_cost_equivalent"
    }); // Balancing value

    return schema;
  }

    static async findById(id) {
    return game.items?.find(i => i.type === "staple" && i.system?.id === id) ?? null;
  }

}