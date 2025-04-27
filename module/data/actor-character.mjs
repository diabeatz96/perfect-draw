import PerfectDrawActorBase from "./base-actor.mjs";

export default class PerfectDrawCharacter extends PerfectDrawActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();


    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.

  }

  getRollData() {
    const data = {};

  
    return data
  }
}