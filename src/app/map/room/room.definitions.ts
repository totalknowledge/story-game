import { RoomModel } from "./room.model";

export type Coordinates = {
    x: number,
    y: number,
    z: number
}

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export const REVERSE_DIRECTIONS = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'up': 'down',
    'down': 'up'
}

export type Connection = {
    name?: string,
    connection: string,
    status: string,
    options: Record<string, string>
}

export const ROOM_TEMPLATES: Partial<RoomModel>[] = [
    {
        typeid: "room-001",
        description: "A modest stone kitchen with a heavy oak table at the center and shelves lined with clay jars. A cold hearth dominates one wall, suggesting it has not been used in some time. The air smells faintly of herbs and old smoke, but everything is otherwise quiet and still."
    },
    {
        typeid: "room-002",
        description: "This appears to be a former guard barracks with several simple bunks arranged neatly along the walls. A few footlockers sit at the ends of the beds, some slightly open. Dust covers most surfaces, but the room feels structurally sound."
    },
    {
        typeid: "room-003",
        description: "A spacious library filled with tall wooden bookcases, many still holding weathered volumes. A large reading table sits near the center with a single overturned chair beside it. Light filters in faintly through a high window, giving the room a calm, scholarly feel."
    },
    {
        typeid: "room-004",
        description: "This room looks like a workshop, with a sturdy bench covered in tools and scraps of metal. A forge sits cold in the corner, its chimney stretching upward. The scent of iron and ash lingers in the air."
    },
    {
        typeid: "room-005",
        description: "A comfortable sitting room with faded rugs and a pair of worn armchairs near a small table. A cracked portrait hangs slightly crooked on the wall. Despite its age, the room still feels welcoming."
    },
    {
        typeid: "room-006",
        description: "An old dining hall with a long wooden table stretching almost the full length of the space. Several chairs remain upright, though a few have toppled over. The atmosphere suggests it once hosted lively gatherings."
    },
    {
        typeid: "room-007",
        description: "A tidy study chamber with a writing desk placed beneath a narrow window. Papers lie scattered across the surface, some curled with age. The room feels quiet and contemplative."
    },
    {
        typeid: "room-008",
        description: "A storage pantry with sturdy shelves holding empty crates and baskets. A faint smell of dried grain remains in the air. The space is functional and plain, clearly meant for practicality."
    },
    {
        typeid: "room-009",
        description: "This bedroom contains a neatly made bed, a small wardrobe, and a simple washstand. The linens are old but clean. The room has a peaceful, lived-in feel."
    },
    {
        typeid: "room-010",
        description: "A bathing room with a large stone tub and several clay pitchers nearby. Moisture stains the walls slightly, hinting at frequent past use. The space feels utilitarian but well designed."
    },
    {
        typeid: "room-011",
        description: "A modest chapel room with wooden benches arranged toward a small altar. Candlesticks sit unlit, coated in wax drips from previous services. The atmosphere is calm and reflective."
    },
    {
        typeid: "room-012",
        description: "This music room holds a dusty upright piano and several wooden stands for instruments. Sheet music lies scattered across the floor. The acoustics here are surprisingly warm."
    },
    {
        typeid: "room-013",
        description: "A classroom-like space with a chalkboard and rows of simple desks. Chalk dust still clings faintly to the board. The room feels educational rather than formal."
    },
    {
        typeid: "room-014",
        description: "An indoor garden room where planter boxes line the walls. Most plants are gone, but traces of soil and irrigation channels remain. The air feels slightly fresher here."
    },
    {
        typeid: "room-015",
        description: "A tailor’s workspace with a large cutting table and several bolts of faded cloth. Needles and thread spools remain carefully arranged. The room feels meticulous and craft-focused."
    },
    {
        typeid: "room-016",
        description: "A modest office with a ledger desk, a high-backed chair, and locked cabinets. Papers remain stacked neatly, suggesting an organized occupant. The setting feels administrative."
    },
    {
        typeid: "room-017",
        description: "A guest bedroom with a small bed, a nightstand, and a single chair near the wall. The décor is minimal but tasteful. It feels prepared for short stays rather than permanent residence."
    },
    {
        typeid: "room-018",
        description: "A trophy room displaying empty mounts and pedestals where objects once stood. Dust outlines hint at missing artifacts. The room carries a faint sense of past pride."
    },
    {
        typeid: "room-019",
        description: "A map room with a large central table once used for planning. Several faded charts hang on the walls. The environment suggests strategic discussion once occurred here."
    },
    {
        typeid: "room-020",
        description: "A lounge area with low couches, a circular rug, and a small fireplace. The seating arrangement encourages conversation. The atmosphere feels relaxed despite the age of the furnishings."
    },
    {
        typeid: "room-021",
        description: "A long corridor lined with tall, arched windows. Most of the glass is shattered, letting in a cold breeze that whistles through the frames."
    },
    {
        typeid: "room-022",
        description: "An abandoned pantry filled with empty wooden crates. The faint smell of dried herbs and rot lingers in the stagnant air."
    },
    {
        typeid: "room-023",
        description: "A narrow spiral staircase made of wrought iron. It feels shaky, and the metal is pitted with rust from years of dampness."
    },
    {
        typeid: "room-024",
        description: "A flooded cellar where the water reaches your ankles. Dark algae slick the floor, making every step a gamble."
    },
    {
        typeid: "room-025",
        description: "A small conservatory with a glass ceiling. Dead vines hang from the rafters like skeletal fingers."
    },
    {
        typeid: "room-026",
        description: "A cluttered workshop filled with rusted clockwork parts and half-finished brass gadgets. A thick layer of oil covers the workbenches."
    },
    {
        typeid: "room-027",
        description: "A shrine dedicated to an unknown deity. A headless stone statue stands in the center, surrounded by burnt-out candle stubs."
    },
    {
        typeid: "room-028",
        description: "An armory with empty weapon racks. A single dented shield remains bolted to the wall, far out of reach."
    },
    {
        typeid: "room-029",
        description: "A dusty library where the shelves have collapsed into a mountain of rotting parchment and leather bindings."
    },
    {
        typeid: "room-030",
        description: "A wide balcony overlooking a dark, bottomless chasm. The stone railing is cracked and looks ready to crumble."
    },
    {
        typeid: "room-031",
        description: "A sterile infirmary with iron cots and stained linens. Glass vials are smashed across the floor, glinting in the dim light."
    },
    {
        typeid: "room-032",
        description: "A guard room featuring a heavy oak table and a deck of moldy playing cards. The wall is covered in frantic tally marks."
    },
    {
        typeid: "room-033",
        description: "A small alchemy lab where a faint purple vapor rises from a cracked beaker. The air tastes metallic."
    },
    {
        typeid: "room-034",
        description: "A servant’s quarters with cramped bunk beds. A small, wooden toy sits lonely in the corner of a bottom bunk."
    },
    {
        typeid: "room-035",
        description: "A grand ballroom with a checkered marble floor. A massive chandelier hangs precariously by a single rusted chain."
    },
    {
        typeid: "room-036",
        description: "A trophy room displaying the stuffed heads of strange, multi-eyed beasts. Their glass eyes seem to follow your movement."
    },
    {
        typeid: "room-037",
        description: "A cold storage room lined with thick slabs of slate. The temperature here is noticeably lower than in the surrounding halls."
    },
    {
        typeid: "room-038",
        description: "A torture chamber with a rusted iron maiden and a rack. The floor is stained a dark, permanent crimson."
    },
    {
        typeid: "room-039",
        description: "A secret study hidden behind a sliding bookshelf. A map of the surrounding lands is pinned to the desk with a dagger."
    },
    {
        typeid: "room-040",
        description: "A ventilation shaft with a massive, motionless iron fan. The sound of distant dripping echoes up from the darkness below."
    },
    {
        typeid: "room-041",
        description: "A gallery of portraits. The subjects’ faces have been carefully scratched out, leaving only hollow silhouettes in the frames."
    },
    {
        typeid: "room-042",
        description: "A wine cellar with rows of dusty bottles. Most have turned to vinegar, but a few still hold a deep, dark liquid."
    },
    {
        typeid: "room-043",
        description: "A solarium filled with petrified plants. Their leaves are as hard as stone and sharp enough to draw blood."
    },
    {
        typeid: "room-044",
        description: "A map room with a giant wooden table. Carved wooden tokens represent armies frozen in the middle of an ancient battle."
    },
    {
        typeid: "room-045",
        description: "A laundry room with heavy stone basins. The smell of lye still lingers, despite the decades of disuse."
    },
    {
        typeid: "room-046",
        description: "A kennel with iron bars and chewed bones. Large claw marks are gouged deep into the stone walls."
    },
    {
        typeid: "room-047",
        description: "A smoking room with leather wingback chairs. A heavy cigar humidor sits on a side table, its contents long since turned to ash."
    },
    {
        typeid: "room-048",
        description: "A hidden crawlspace behind a loose wall panel. It is cramped, dark, and filled with cobwebs that cling to your skin."
    },
    {
        typeid: "room-049",
        description: "An indoor fountain that has long since dried up. The basin is filled with copper coins, turned green by age."
    },
    {
        typeid: "room-050",
        description: "A high-ceilinged chapel with cracked stained glass. The sunlight filtering through casts jagged, colorful patterns on the dust-covered pews."
    },
    {
        typeid: 'town-square',
        description: 'The center of town. A weathered stone fountain sits in the middle, its water long dried up. People bustle about with a sense of quiet urgency.',
    },
    {
        typeid: 'town-ns-shops',
        description: 'A street lined with various stalls. To the north and south, shop doors creak in the wind.',
    },
    {
        typeid: 'town-ew-road',
        description: 'A dusty road stretching toward the town gates. The cobblestones are worn smooth by years of travel.',
    },
    {
        typeid: 'town-bank',
        description: 'A heavily fortified building with thick iron bars over the windows. The air smells of old parchment and cold copper.',
        featureTypeids: ['feature-vault']
    },
    {
        typeid: 'town-ew-shops',
        description: 'A row of small storefronts. Smoke rises from a blacksmith’s chimney nearby.',
        featureTypeids: ['feature-blacksmith-forge']
    },
    {
        typeid: 'town-ns-road',
        description: 'A quiet residential road. The houses here are small but well-maintained.',
    },
    {
        typeid: 'town-shop',
        description: 'The General Store. Shelves are packed with rope, lanterns, and various supplies for the aspiring adventurer.',
        featureTypeids: ['feature-merchant-stall']
    },
    {
        typeid: 'town-empty-shops',
        description: 'Abandoned storefronts with boarded-up windows. Dust motes dance in the slivers of light.',
    }
];