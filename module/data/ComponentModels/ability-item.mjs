import PerfectDrawItemBase from "../base-item.mjs";

export default class PerfectDrawAbility extends PerfectDrawItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.name = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Ability.name"
    }); // Display name

    schema.description = new fields.HTMLField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Ability.description"
    }); // Full rules text

    schema.playbook_origin = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Ability.playbook_origin"
    }); // Playbook association

    schema.selection_type = new fields.StringField({
      required: true,
      blank: false,
      label: "PERFECT_DRAW.Ability.selection_type"
    }); // How the ability is obtained

    schema.requirements = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Ability.requirements.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Ability.requirements" }
    ); // Prerequisite abilities

    schema.tags = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Ability.tags.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Ability.tags" }
    ); // Keywords/tags

    schema.linked_options = new fields.ArrayField(
      new fields.StringField({ required: false, blank: true, label: "PERFECT_DRAW.Ability.linked_options.item" }),
      { required: false, initial: [], label: "PERFECT_DRAW.Ability.linked_options" }
    ); // Further definition/choices

    schema.notes = new fields.HTMLField({
      required: false,
      blank: true,
      label: "PERFECT_DRAW.Ability.notes"
    }); // Judge/thematic notes

    return schema;
  }

}