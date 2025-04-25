import PerfectDrawDataModel from "./base-model.mjs";

export default class PerfectDrawItemBase extends PerfectDrawDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });

    return schema;
  }

}