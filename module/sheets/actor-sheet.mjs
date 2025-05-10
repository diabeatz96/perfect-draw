import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PerfectDrawActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['perfect-draw', 'sheet', 'actor'],
      width: 765,
      height: 802,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/perfect-draw/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.PERFECT_DRAW
    context.config = CONFIG.PERFECT_DRAW;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }

    html.find('.add-struggle').click(ev => {
      ev.preventDefault();
      console.log("Adding struggle");
      const struggles = Array.from(this.actor.system.struggles ?? []);
      struggles.push("");
      this.actor.update({"system.struggles": struggles});
    });
    html.find('.delete-struggle').click(ev => {
      ev.preventDefault();
      const idx = Number(ev.currentTarget.dataset.index);
      let struggles = Array.from(this.actor.system.struggles ?? []);
      struggles.splice(idx, 1);
      this.actor.update({"system.struggles": struggles});
    });
    html.find('.add-friend').click(ev => {
      ev.preventDefault();
      const friends = Array.from(this.actor.system.friends ?? []);
      friends.push("");
      this.actor.update({"system.friends": friends});
    });
    html.find('.delete-friend').click(ev => {
      ev.preventDefault();
      const idx = Number(ev.currentTarget.dataset.index);
      let friends = Array.from(this.actor.system.friends ?? []);
      friends.splice(idx, 1);
      this.actor.update({"system.friends": friends});
    });
    html.find('.rollable-stat').click(async ev => {
      const stat = ev.currentTarget.dataset.stat;
      const statValue = this.actor.system.stats_data?.[stat] ?? 0;
      const roll = new Roll(`2d6 + ${statValue}`);
      await roll.evaluate();
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${game.i18n.localize(`PERFECT_DRAW.Character.stats_data.${stat}`)} Roll`
      });
    });
    
    const dropzone = html.find('.moves-section');
    dropzone.on('dragover', ev => {
      ev.preventDefault();
      dropzone.addClass('dragover');
    });
    dropzone.on('dragleave', ev => {
      dropzone.removeClass('dragover');
    });
    dropzone.on('drop', async ev => {
      ev.preventDefault();
      dropzone.removeClass('dragover');
      let data;
      try {
        data = JSON.parse(ev.originalEvent.dataTransfer.getData('application/json'));
      } catch {
        data = JSON.parse(ev.originalEvent.dataTransfer.getData('text/plain'));
      }
      if (data.type === "Item" && data.uuid) {
        const item = await fromUuid(data.uuid);
        if (item && item.type === "move") {
          const moves = Array.from(this.actor.system.moves ?? []);
          // Remove any existing move with same id (prevent duplicates)
          const filtered = moves.filter(m => m.id !== item.id);
          filtered.push({
            id: item.id,
            type: item.system.type ?? "general-player",
            img: item.img,
            name: item.name,
            description: item.system.description,
            outcomes: item.system.outcomes ?? { high: "", mid: "", low: "" },
            roll_stat: item.system.roll_stat ?? "passion",
          });
          await this.actor.update({ "system.moves": filtered });
        }
      }
    });

     // Open move item sheet on icon click
      html.find('.clickable-move-img').click(async ev => {
        const moveId = ev.currentTarget.dataset.moveId;
        let moveItem = game.items?.get(moveId);
        if (!moveItem) {
          // Try compendiums if not found in world
          for (let pack of game.packs.filter(p => p.documentName === "Item")) {
            const index = await pack.getIndex();
            const entry = index.find(e => e._id === moveId);
            if (entry) {
              moveItem = await pack.getDocument(moveId);
              break;
            }
          }
        }
        if (moveItem) moveItem.sheet.render(true);
        else ui.notifications.warn(game.i18n.localize("PERFECT_DRAW.MoveNotFound"));
      });

      // Add Move: open item sheet, then add to actor when saved
    html.find('.add-move').click(async ev => {
      ev.preventDefault();
      const type = ev.currentTarget.dataset.movetype || "general-player";
      const item = await Item.create({
        name: game.i18n.localize("PERFECT_DRAW.Move.name"),
        type: "move",
        img: "icons/svg/d20-black.svg",
        system: { type }
      }, { renderSheet: true });
      if (item) {
        Hooks.once("updateItem", async (createdItem, changes, options, userId) => {
          if (createdItem.id !== item.id) return;
          const moves = Array.from(this.actor.system.moves ?? []);
          moves.push({
            id: createdItem.id,
            type: createdItem.system.type ?? type,
            img: createdItem.img,
            name: createdItem.name,
            description: createdItem.system.description,
            roll_stat: createdItem.system.roll_stat ?? "passion",
            outcomes: createdItem.system.outcomes ?? { high: "", mid: "", low: "" }
          });
          await this.actor.update({ "system.moves": moves });
        });
      }
    });

    html.find('.roll-move').click(async ev => {
      ev.preventDefault();
      const moveId = ev.currentTarget.dataset.id;
      const moves = Array.from(this.actor.system.moves ?? []);
      const move = moves.find(m => m.id === moveId);
      if (!move) return;
      const statKey = (move.roll_stat || "passion").toLowerCase();
      const statValue = this.actor.system.stats_data?.[statKey] ?? 0;

      // Get global baggage modifiers
      const baggageModifier = this.actor.system.baggageModifier ?? 0;
      const seriousBaggage = this.actor.system.seriousBaggage ?? false;

      let mod = statValue;
      let baggageLog = "";
      if (seriousBaggage) {
        mod = -1;
        baggageLog = `<div style="color:#b71c1c;font-size:0.95em;">Serious Baggage: All rolls set to -1</div>`;
      } else if (baggageModifier > 0) {
        const applied = Math.max(-1, statValue - baggageModifier);
        baggageLog = `<div style="color:#b71c1c;font-size:0.95em;">Baggage Modifier: -${baggageModifier} (Stat ${statValue} → ${applied})</div>`;
        mod = applied;
      }

      const roll = new Roll(`2d6 + ${mod}`);
      await roll.evaluate();
      let outcomeMsg = "";
      let outcomeColor = "#3949ab";
      let outcomeHeader = "";
      let outcomeBg = "#e3eafc";
      const total = roll.total ?? 0;
      if (total >= 10) {
        outcomeMsg = move.outcomes?.high || "";
        outcomeColor = "#388e3c"; // green
        outcomeBg = "#e8f5e9";
        outcomeHeader = game.i18n.localize("PERFECT_DRAW.Move.OutcomeSuccess");
      } else if (total >= 7) {
        outcomeMsg = move.outcomes?.mid || "";
        outcomeColor = "#e65100"; // dark orange
        outcomeBg = "#fff8e1";
        outcomeHeader = game.i18n.localize("PERFECT_DRAW.Move.OutcomeComplications");
      } else {
        outcomeMsg = move.outcomes?.low || "";
        outcomeColor = "#d32f2f"; // red
        outcomeBg = "#ffebee";
        outcomeHeader = game.i18n.localize("PERFECT_DRAW.Move.OutcomeFailed");
      }

      const outcomeStyle = `
        color:${outcomeColor};
        background:${outcomeBg};
        border-radius:0.3em;
        padding:0.2em 0.7em;
        font-size:1.25em;
        font-weight:bold;
        margin:0.5em 0 0.2em 0;
        display:inline-block;
      `;

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `
          <div class="pd-move-roll">
            <h1>${move.name}</h1>
            ${move.description ? `<h2 style="font-size:1em;font-weight:normal;color:#444;margin-bottom:0.7em;margin-top:0;">${move.description}</h2>` : ""}
            ${baggageLog}
            <h2 style="${outcomeStyle}">${outcomeHeader}</h2>
            <div style="margin-top:0.7em;font-size:1em;">${outcomeMsg}</div>
            <div style="margin-top:0.7em;font-size:1em;">Roll: <strong>${roll.formula}</strong> = ${total}</div>
            <div> BaggageModifier: <strong>${baggageModifier}</strong></div>
            <div> SeriousBaggage: <strong>${seriousBaggage ? "Yes" : "No"}</strong></div>
          </div>
        `
      });
    });


          // Delete move
      html.find('.delete-move').click(ev => {
        ev.preventDefault();
        const moveId = ev.currentTarget.dataset.id;
        let moves = Array.from(this.actor.system.moves ?? []);
        const idx = moves.findIndex(m => m.id === moveId);
        if (idx !== -1) {
          moves.splice(idx, 1);
          this.actor.update({ "system.moves": moves });
        }
      });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
