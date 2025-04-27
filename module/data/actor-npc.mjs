import PerfectDrawActorBase from "./base-actor.mjs";

export default class PerfectDrawNPC extends PerfectDrawActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    return schema
  }

  prepareDerivedData() {
   
  }
}