import { Injectable } from '@angular/core';
import { pickRandom } from '../utilities/dice.definitions';

@Injectable({
  providedIn: 'root',
})
export class NameService {
  private readonly heroData: [string, string][] = [
    ["Galahad", "male"], ["Anharn", "male"], ["Belorion", "male"], ["Edrath", "male"],
    ["Hercules", "male"], ["Thalric", "male"], ["Valerius", "male"], ["Kaelen", "male"],
    ["Isolde", "female"], ["Zephyra", "female"], ["Caspian", "male"], ["Elowen", "female"],
    ["Garrick", "male"], ["Brynne", "female"], ["Aurelius", "male"], ["Morgath", "male"],
    ["Lyra", "female"], ["Draven", "male"], ["Sylas", "male"], ["Rowan", "male"],
    ["Althea", "female"], ["Kestrel", "female"], ["Sigurd", "male"], ["Beowulf", "male"],
    ["Haldor", "male"], ["Fenris", "male"], ["Vespera", "female"], ["Torin", "male"],
    ["Xanthe", "female"], ["Leandros", "male"], ["Seraphina", "female"], ["Caelum", "male"],
    ["Icarus", "male"], ["Elara", "female"], ["Roderick", "male"], ["Cormac", "male"],
    ["Finnian", "male"], ["Soren", "male"], ["Tamsin", "female"], ["Varick", "male"],
    ["Ignatius", "male"], ["Octavia", "female"], ["Hadrian", "male"], ["Lucius", "male"],
    ["Cassian", "male"], ["Thalia", "female"], ["Evander", "male"], ["Perseus", "male"],
    ["Orion", "male"], ["Atlas", "male"], ["Calliope", "female"], ["Lysander", "male"],
    ["Eamon", "male"], ["Kaelith", "female"], ["Balthazar", "male"], ["Sterling", "male"],
    ["Arcturus", "male"], ["Valen", "male"], ["Runa", "female"], ["Eirik", "male"],
    ["Theon", "male"], ["Alistair", "male"], ["Vance", "male"], ["Jaxon", "male"],
    ["Kael", "male"], ["Nyx", "female"], ["Solara", "female"], ["Titus", "male"],
    ["Kira", "female"], ["Saber", "male"]
  ];

  private readonly enemyData: [string, string][] = [
    ["Gorgos", "male"], ["Malphas", "male"], ["Xyloth", "male"], ["Vrak", "male"],
    ["Skinner", "male"], ["Bone-Cruncher", "male"], ["Night-Stalker", "male"],
    ["Blood-Feast", "male"], ["Ulgoth", "male"], ["Draznax", "male"],
    ["Krix", "male"], ["Void-Wraith", "male"], ["Gloom-Stalker", "male"],
    ["Shadow-Reaper", "male"], ["Abyssal-Maw", "male"], ["Cinder-Husk", "male"],
    ["Rot-Walker", "male"], ["Blight-Crawler", "male"], ["Flesh-Stitcher", "male"],
    ["Skitter-Kin", "female"], ["Marrow-Driller", "male"], ["Soul-Eater", "male"],
    ["Grim-Tongue", "male"], ["Ichor-Swell", "male"], ["Pox-Bringer", "male"],
    ["Grave-Bound", "male"], ["Sorrow-Knight", "male"], ["Iron-Gnasher", "male"],
    ["Fang-Lord", "male"], ["Scalp-Hunter", "male"], ["Kruel", "male"],
    ["Vile-Eye", "male"], ["Death-Knell", "female"], ["Ruin-Walker", "male"],
    ["Bane-Guard", "male"], ["Hell-Hog", "male"], ["Slime-Brute", "male"],
    ["Twist-Limb", "male"], ["Murk-Fiend", "male"], ["Spider-Queen", "female"],
    ["Web-Weaver", "female"], ["Venom-Spit", "female"], ["Gore-Horn", "male"],
    ["Thrax", "male"], ["Mordrin", "male"], ["Silas the Wicked", "male"],
    ["Kaelen the Betrayer", "male"], ["Varoth the Cruel", "male"], ["Elara the Damned", "female"],
    ["Balthazar the Black", "male"], ["Vane", "male"], ["The Collector", "male"],
    ["The Puppet Master", "male"], ["The Nameless", "male"], ["The Hollow", "male"],
    ["Obsidian", "male"], ["Iron-Claw", "male"], ["Frost-Bite", "male"],
    ["Ash-Walker", "male"], ["Thunder-Hoof", "male"], ["Storm-Caller", "female"],
    ["Magma-Crag", "male"], ["Stone-Crusher", "male"], ["Dread-Wing", "male"],
    ["Acid-Tongue", "male"], ["Slaughter-Beast", "male"], ["Troll-King", "male"],
    ["Goblin-Chief", "male"], ["Orc-Warlord", "male"], ["Chaos-Priest", "male"]
  ];

  public getHeroName(genderFilter?: string): { name: string, gender: string } {
    return this.getRandomNameFromSet(this.heroData, genderFilter);
  }

  public getEnemyName(genderFilter?: string): { name: string, gender: string; } {
    return this.getRandomNameFromSet(this.enemyData, genderFilter);
  }

  private getRandomNameFromSet(source: [string, string][], genderFilter?: string): { name: string, gender: string; } {
    const filteredSet = genderFilter
      ? source.filter(entry => entry[1] === genderFilter)
      : source;

    const finalSet = filteredSet.length > 0 ? filteredSet : source;
    const [name, gender] = pickRandom(finalSet);

    return { name, gender };
  }
}