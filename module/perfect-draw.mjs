// Import document classes.
import { PerfectDrawActor } from './documents/actor.mjs';
import { PerfectDrawItem } from './documents/item.mjs';
// Import sheet classes.
import { PerfectDrawActorSheet } from './sheets/actor-sheet.mjs';
import { PerfectDrawItemSheet } from './sheets/item-sheet.mjs';
import { CCMIntegration } from './helpers/ccm-integration.mjs';
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { PERFECT_DRAW } from './helpers/config.mjs';

// Import DataModel classes
import * as models from './data/_module.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.perfectdraw = {
    PerfectDrawActor,
    PerfectDrawItem,
    rollItemMacro,
  };

  game.perfectdraw.CCMIntegration = CCMIntegration;

  // Add custom constants for configuration.
  CONFIG.PERFECT_DRAW = PERFECT_DRAW;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = PerfectDrawActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.PerfectDrawCharacter,
    npc: models.PerfectDrawNPC
  }

  CONFIG.Item.documentClass = PerfectDrawItem;
  CONFIG.Item.dataModels = {
    ability: models.PerfectDrawAbility,
    baggage: models.PerfectDrawBaggage,
    keyword: models.PerfectDrawKeyword,
    playbook: models.PerfectDrawPlaybook,
    move: models.PerfectDrawMove
  }

  
  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('perfect-draw', PerfectDrawActorSheet, {
    makeDefault: true,
    label: 'PERFECT_DRAW.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('perfect-draw', PerfectDrawItemSheet, {
    makeDefault: true,
    label: 'PERFECT_DRAW.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.perfectdraw.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'perfect-draw.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

// Sidebar buttons (for v13+)
Hooks.on('renderSidebar', (app, html, data) => {
  try {
    // Support both v12 (html[0]) and v13+ (html is element)
    const sidebar = html instanceof HTMLElement ? html : html[0];
    if (!sidebar) return;

    // Only add once
    if (sidebar.querySelector('.perfectdraw-sidebar-main-btns')) return;

    // Find the Game Settings button's <li>
    const settingsBtn = sidebar.querySelector('button[data-tab="settings"]')?.parentElement;
    if (!settingsBtn) return; // If not found, just skip (likely not v13+)

    // Build your custom button group as a <li> for consistency
    const isGM = game.user.isGM;
    const btns = document.createElement('li');
    btns.className = "perfectdraw-sidebar-main-btns";
    btns.style.display = "flex";
    btns.style.flexDirection = "column";
    btns.style.alignItems = "center";
    btns.style.justifyContent = "center";
    btns.style.gap = "0.25em";
    btns.style.margin = "0.25em 0";

    btns.innerHTML = `
      <button type="button" class="ui-control plain icon perfectdraw-create-deck" title="${game.i18n.localize("PERFECT_DRAW.CreateDeck")}">
        <i class="fas fa-layer-group"></i>
      </button>
      <button type="button" class="ui-control plain icon perfectdraw-create-card" title="${game.i18n.localize("PERFECT_DRAW.CreateCard")}">
        <i class="fas fa-clone"></i>
      </button>
      ${isGM ? `<button type="button" class="ui-control plain icon perfectdraw-view-character-info" title="${game.i18n.localize("PERFECT_DRAW.ViewCharacterInfo")}">
        <i class="fas fa-user"></i>
      </button>` : ''}
    `;

    // Insert after the settings <li>
    settingsBtn.after(btns);

    // Event listeners (vanilla JS)
    btns.querySelector('.perfectdraw-create-deck').addEventListener('click', () => {
      ui.notifications.info("[PerfectDraw] Create Deck dialog would open here.");
    });
    btns.querySelector('.perfectdraw-create-card').addEventListener('click', () => {
      ui.notifications.info("[PerfectDraw] Create Card dialog would open here.");
    });
    if (isGM) {
      btns.querySelector('.perfectdraw-view-character-info').addEventListener('click', () => {
        ui.notifications.info("[PerfectDraw] View Character Info dialog would open here.");
      });
    }
  } catch (err) {
    // If this errors, it's likely just a version mismatch or missing sidebar structure
    console.warn("[PerfectDraw] Sidebar render skipped (likely not v13+):", err);
  }
});

Hooks.on('renderHotbar', (app, html, data) => {
  try {
    // v12: html is a jQuery-like array, v13: html is the element
    const hotbar = html instanceof HTMLElement ? html : html[0];
    if (hotbar.querySelector('.perfectdraw-hotbar-btns')) return;

    const isGM = game.user.isGM;
    const btns = document.createElement('div');
    btns.className = "perfectdraw-hotbar-btns";
    btns.style.display = "flex";
    btns.style.flexDirection = "row";
    btns.style.alignItems = "center";
    btns.style.justifyContent = "center";
    btns.style.gap = "0.25em";
    btns.style.marginLeft = "1em";
    btns.innerHTML = `
      <button type="button" class="ui-control plain icon perfectdraw-create-deck" title="${game.i18n.localize("PERFECT_DRAW.CreateDeck")}">
        <i class="fas fa-layer-group"></i>
      </button>
      <button type="button" class="ui-control plain icon perfectdraw-create-card" title="${game.i18n.localize("PERFECT_DRAW.CreateCard")}">
        <i class="fas fa-clone"></i>
      </button>
      ${isGM ? `<button type="button" class="ui-control plain icon perfectdraw-view-character-info" title="${game.i18n.localize("PERFECT_DRAW.ViewCharacterInfo")}">
        <i class="fas fa-user"></i>
      </button>` : ''}
    `;
    hotbar.appendChild(btns);
    btns.querySelector('.perfectdraw-create-deck').addEventListener('click', () => {
      ui.notifications.info("[PerfectDraw] Create Deck dialog would open here.");
    });
    btns.querySelector('.perfectdraw-create-card').addEventListener('click', () => {
      ui.notifications.info("[PerfectDraw] Create Card dialog would open here.");
    });
    if (isGM) {
      btns.querySelector('.perfectdraw-view-character-info').addEventListener('click', () => {
        ui.notifications.info("[PerfectDraw] View Character Info dialog would open here.");
      });
    }
    console.log("Hotbar buttons added", hotbar);
  } catch (err) {
    console.warn("[PerfectDraw] Hotbar render skipped (likely not v12):", err);
  }
});


Hooks.on = new Proxy(Hooks.on, {
  apply(target, thisArg, argumentsList) {
    const [hookName, fn] = argumentsList;
    console.log(`[HOOK REGISTERED] ${hookName}`);
    return Reflect.apply(target, thisArg, argumentsList);
  }
});
Hooks.callAll = new Proxy(Hooks.callAll, {
  apply(target, thisArg, argumentsList) {
    const [hookName] = argumentsList;
    console.log(`[HOOK CALLED] ${hookName}`);
    return Reflect.apply(target, thisArg, argumentsList);
  }
});