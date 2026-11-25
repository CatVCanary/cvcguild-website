"use strict";

const TableContent = (() => {
  const getty = ["Getty Museum · Ancient games and reconstructions", "https://www.getty.edu/education/college/ancient_rome_at_home/pdf/all_games.pdf"];
  const crossRules = ["Masters Traditional Games · Pachisi and Chaupar", "https://www.mastersofgames.com/rules/pachisi-rules.htm"];

  return {
    ur: {
      title: "Royal Game of Ur", region: "Ancient Mesopotamia", subtitle: "Race · Two players",
      description: "A race along a path of rosettes.",
      goal: "Bring all seven counters off the far end.",
      quick: ["Throw four tetrahedra and count the marked tips. A zero passes the turn.", "Choose one counter to enter or advance. A rosette earns another throw.", "Capture in the shared lane. The central rosette protects its occupant. Leave by an exact throw."],
      rules: ["There are twenty squares. Each side has fourteen steps along its route. Enter on your own wing, cross the shared lane and turn into your far wing.", "Each tetrahedron has two marked tips. Move one counter by the number of marked tips. Your own counters cannot share a square.", "A landing on an opponent’s counter in the middle lane sends it back to reserve. Opponents cannot land on an occupied rosette. A valid landing on any rosette gives another throw.", "Enter from reserve on any positive throw or move one counter already in play. To bear off, count one step beyond your final rosette. If blocked, pass."],
      history: "Boards and counters were excavated from the Royal Cemetery at Ur in present-day Iraq. A much later Babylonian tablet preserves rules for a related game. This seven-counter, four-tetrahedron table uses the popular Finkel-style short-route reconstruction.",
      sources: [["British Museum · Board from Ur", "https://www.britishmuseum.org/collection/object/W_1928-1009-378"], ["RoyalUr · Finkel-style rules and route", "https://royalur.net/rules"]],
    },
    senet: {
      title: "Senet", region: "Ancient Egypt", subtitle: "Race · Two players",
      description: "Thirty houses and a passage through them.",
      goal: "Get all seven pieces through the last houses and off the board.",
      quick: ["Throw the four sticks. Count marked faces, with four blank faces worth five. A move of one, four or five normally earns a fresh throw.", "Follow house numbers. Swap with an unguarded rival. Land on 26 before you go farther.", "Water stops the turn. From 28 cast three to leave; from 29 cast two; from 30 any throw works."],
      rules: ["Seven cones occupy odd houses 1–13, and seven spools occupy even houses 2–14. Cones start. Move across, back and across through thirty houses.", "Jump over pieces. Land on an unguarded rival to exchange places. Adjacent pieces of the same side guard one another, including around bends. Your own pieces and rivals in the final three houses cannot be displaced.", "If no forward move exists, move backward by the full throw if possible. If both directions are blocked, the throw is lost. One, four and five earn another throw after a successful move outside Water.", "Every piece must stop on 26 before it can move farther. Landing on 27 ends the turn. Next turn, either send the trapped piece to 15 if it is empty and end the turn, or throw exactly four to take it off. Failed casts pass the turn.", "Houses 28, 29 and 30 are exits only. On 28 throw three, on 29 throw two, and on 30 use any throw. Each removes one piece."],
      history: "Ancient Egyptian boards preserve thirty houses and a variety of equipment and marks. Senet later acquired associations with the journey into the afterlife. This table follows the Guild’s simplified Kendall-based teaching draft, via Damian Walker. The full ancient rules are unknown.",
      sources: [["Guild · Senet simplified reading draft", "https://drive.google.com/file/d/1p-q6SAJgE99339aJ-B_DomUjyMQryN0k/view"], ["The Met · Board games from Egypt and the Near East", "https://www.metmuseum.org/perspectives/board-games-from-ancient-egypt-and-the-near-east"], ["Cyningstan · Senet", "https://www.cyningstan.com/game/3/senet"]],
    },
    hounds: {
      title: "Hounds and Jackals", region: "Egypt and the Near East", subtitle: "Peg race · Two players",
      description: "Follow the carved shortcuts to the shen.",
      goal: "Guide five hound or jackal pegs to the shared goal.",
      quick: ["Throw four sticks. Count marked faces. Four blank faces count as five.", "Move one peg along your own strand. Holes 6 and 8 lead to shortcuts. A nefer hole earns another throw.", "Enter the shared goal by an exact throw."],
      rules: ["The two players use separate tracks of 29 holes and one shared goal. Start with five pegs in reserve per side. A positive throw can bring one peg in or move one already on the board.", "At this table, landing on 6 sends a peg to 20, and 8 sends it to 10. Only the outward shortcut applies. Holes 15 and 25 earn another throw. A peg cannot land on or jump to an occupied hole.", "The goal is the thirtieth step of either route. Move into it by the exact count and remove the finished peg. Pass when every move is blocked or would overshoot."],
      history: "The Met’s Theban set preserves a 58-hole board with carved hound and jackal pegs. Similar boards are known across Egypt and the Near East. The board here is a playable diagram of that family. Four sticks, one-way shortcuts and the bonus holes belong to this reconstruction.",
      sources: [["The Met · Reniseneb’s board and pegs", "https://www.metmuseum.org/art/collection/search/543867"], ["The Met · Hounds and Jackals", "https://www.metmuseum.org/perspectives/ancient-egypt-game"], ["Arcadia · One documented teaching reconstruction", "https://arcadiagames.io/guides/hounds-and-jackals"]],
    },
    ludus: {
      title: "Ludus Duodecim Scriptorum", region: "Roman world", subtitle: "Roman tables · Two players",
      description: "Run fifteen counters through three rows.",
      goal: "Bring all fifteen counters into the final six points, then bear them off.",
      quick: ["Roll three cubic dice. Use single dice to enter all fifteen counters into your half of the middle row.", "Use individual dice or legal sums to advance. Two rival counters block a landing. A lone rival goes back to reserve.", "Bring all counters to points 25–30, then use exact counts to take them off."],
      rules: ["Enter at private points 1–6 in the middle row. Continue right to left across the upper row (7–18), then left to right across the bottom (19–30). The two longer rows are shared.", "Roll three six-sided dice. Enter one counter per die. If a counter is waiting, enter it before advancing other counters. When your reserve is empty, use the dice individually or in sums. The table shows options that use as many dice as possible.", "Your own counters stack freely. A lone rival counter can be captured, but an opposing stack of two or more bars the landing. It can be jumped. Captured counters return to reserve.", "Once all your counters are in the last six points or off the board, bear off by casting the exact distance to point 31. End the turn when the remaining dice cannot be used."],
      history: "Roman boards often have three rows of twelve marks or letters. The path and mechanics here are a modern reconstruction based on the published Austin/Murray route and common fifteen-counter rules. Choices about combining dice and priority re-entry are stated for this table.",
      sources: [getty, ["Bead Game · Fifteen-counter rules", "https://www.bead.game/games/traditional/ludus-duodecim-scriptorum"]],
    },
    slahal: {
      title: "Slahal / Lahal", region: "Pacific Northwest · Coast Salish communities", subtitle: "Guessing · Two teams",
      description: "Hide two pairs of bones and read the other team.",
      goal: "Win all ten tally sticks by choosing hidden hands and reading the other team.",
      quick: ["The hiding team puts one plain and one marked bone in each of two pairs of hands.", "Pass the screen. Guess where the plain bones are. For each missed pair, the hiding team receives one stick.", "When the last open pair is found, the guessing team takes over hiding. Ten sticks win."],
      rules: ["Start with five counting sticks per team and two pairs of cylindrical bones. Each pair has one plain bone and one marked bone. In pass-and-play, one person controls the two hiding positions for their team.", "Choose the locations from the hiders’ perspective. Outside means the left hand of Hider 1 and the right hand of Hider 2. Inside reverses those choices. Conceal the choice during screen handoff.", "A miss transfers one counting stick for that pair. If one pair is found, continue with only the remaining pair. If both are missed, the same team hides both pairs again. Finding the last open pair moves both pairs to the guessing team, which becomes the hiding team.", "The first team holding all ten sticks wins. The screen models the Guild teaching draft’s transfer rule."],
      history: "Slahal is a living family of games with traditions that vary among Indigenous nations, communities and families. The Guild’s beginner draft teaches concealment and guessing with simplified scoring. Community gatherings can include drums, team songs, language, and distinct protocols. See the community sources for those traditions.",
      sources: [["Guild · Coast Salish history and teaching draft", "https://drive.google.com/file/d/1UTRH_f99mcGmdI0zn4hBHL1w7N0kFgUb/view"], ["Puyallup Tribe · Family-style sləhal", "https://www.puyalluptribe-nsn.gov/news/language-program-welcomes-community-for-family-style/"], ["Tulalip News · Stick-game tournament", "https://www.tulalipnews.com/2017/06/08/tulalip-hosts-8th-annual-stick-game-tournament/"], ["Greater Victoria · Indigenous Education Lahal Program", "https://ied.sd61.bc.ca/cultural-curriculum/lahal/"]],
    },
    pachisi: {
      title: "Pachisi", region: "Indian subcontinent", subtitle: "Partnership race · Four seats",
      description: "Cast six cowries and claim your castles.",
      goal: "Bring all eight of your partnership’s pawns back to the charkoni.",
      quick: ["Yellow and Black play against Red and Green. Each seat has four pawns.", "Count the six cowries. A 6, 10 or 25 is a grace that lets you enter another pawn and throw again.", "Capture rivals on unmarked squares. Use an exact count to go home. From the last square, any throw works."],
      rules: ["The cross has four arms of eight rows by three columns, three castles per arm, and a central charkoni. Follow your central lane out, go anticlockwise around the outside, then return up your own central lane.", "From six cowries, mouths up score 0 → 25, 1 → 10, 2 → 2, 3 → 3, 4 → 4, 5 → 5, 6 → 6. The 6, 10 and 25 are graces. The first pawn can enter on any throw. Other pawns and captured pawns need a grace to enter.", "Use a throw on one pawn or choose to skip the move. Graces and captures earn another throw. An enemy on a castle blocks the landing. A landing elsewhere takes every enemy pawn there and sends it to the charkoni. Friendly pawns can share a space.", "On reaching your home arm again, you can choose another circuit instead of turning for home. Pawns on the inward part of their path have a slash on the board. An exact count returns a pawn to the charkoni. From the last square any throw can finish, since this cowrie table cannot cast a one.", "Both partners must finish. Completed seats sit out. Yellow starts in the screen edition, and each partnership can be operated by one or two people."],
      history: "Pachisi is a South Asian family of cloth-cross partnership games with many local variants. This table follows the six-cowrie Masters teaching version, with the documented last-square digital exception. The screen uses equal independent mouth and back outcomes for the shells.",
      sources: [crossRules, ["Ancient Indian Boardgames · Pachisi documentation", "https://www.indiaboardgamesarchive.in/omekas/s/ancientindianboardgames/item/246"], ["PlayNook · Last-square exception", "https://playnook.io/blog/pachisi-rules-and-strategy"]],
    },
    chaupar: {
      title: "Chaupar", region: "Indian subcontinent", subtitle: "Partnership race · Four seats",
      description: "Throw long dice and move joined pawns.",
      goal: "Bring both partners’ pawns home. Combined pawns can take stronger groups.",
      quick: ["Each side starts at steps 6, 7, 23 and 24 of its route. Throw three long dice marked 1, 2, 5 and 6.", "Spend dice separately or in sums. Pawns of one color that meet at the same route position move together.", "Capture an enemy group with one at least as large. Exact counts finish. Black finishes before Yellow and Red before Green."],
      rules: ["Yellow and Black are partners against Red and Green. The pawns follow the same anticlockwise cross route as Pachisi. After capture, a pawn returns to the charkoni and can enter on a subsequent roll.", "Throw three four-sided long dice, with values 1, 2, 5 and 6. Apply them singly or add unused dice for one move. Play as many dice as legally possible. There are no grace throws or safe castle spaces.", "Pawns of the same seat that land on the same route position form a group and thereafter move as one. An attacking group must equal or exceed the size of the largest opposing group at its landing. The captured pieces return to reserve.", "Take an exact count to finish. Black’s pawns finish before Yellow’s, and Red’s before Green’s. Completed seats sit out. A team wins with eight pawns home."],
      history: "Cross-shaped boards and long dice are documented in South Asia, including the Indian Board Game Survey. Chaupar practices vary by place. This table uses the Masters grouping, casting and partner-finish rules.",
      sources: [crossRules, ["Ancient Indian Boardgames · Chaupar board at Pataleshwar", "https://indiaboardgamesarchive.in/omekas/s/ancientindianboardgames/item/76"]],
    },
    yut: {
      title: "Yut Nori", region: "Korea", subtitle: "Team race · Two sides",
      description: "Cast four yut and take the diagonal home.",
      goal: "Bring all four mal around the board and home.",
      quick: ["Four yut sticks decide the move. One, two, three or four flat faces give Do, Gae, Geol or Yut. All rounded faces give Mo, five.", "Land on a shortcut point to use the diagonal on your next move. Friendly pieces share one move when stacked.", "Yut, Mo and captures earn another throw."],
      rules: ["Start all four mal off the board. Enter from the lower-right home point and travel around the 20-point outer route. The full board has 29 points, including its diagonal paths.", "The cast moves one mal or one stack. Do = 1, Gae = 2, Geol = 3, Yut = 4 and Mo = 5. For this edition, play the move before taking any bonus throw. Backward Do is a separate variant.", "On a move beginning at the top-right or top-left corner, choose the diagonal or the outside. A move beginning at the center takes the route toward home. Passing through a corner or the crossing during a move keeps you on your current line.", "Friendly mal that meet travel together. A capture returns the opponent’s entire group to reserve. Captures, Yut and Mo each earn another cast; overlapping bonuses earn one extra cast at this table.", "Reach or pass the home point to finish. The first side to finish all four wins."],
      history: "Yut Nori is a living Korean game played around Seollal and beyond. The National Folk Museum of Korea documents four sticks, four mal per side and a board of 29 dots. Shortcut and bonus conventions vary across tables.",
      sources: [["National Folk Museum of Korea · Yut Nori", "https://folkency.nfm.go.kr/en/topic/detail/1595"], ["Kabooda · Board, stacks and capture", "https://www.kabooda.com/games/yutnori"]],
    },
    astragaloi: {
      title: "Astragaloi / Knucklebones", region: "Ancient Mediterranean", subtitle: "Casting · Two players",
      description: "Cast four tali to find the throw of Venus.",
      goal: "Be the first to cast all four different faces.",
      quick: ["Cast four knucklebones. Their four usable sides score I, III, IV and VI.", "One of each face is Venus and wins the game. Any other cast passes play."],
      rules: ["Each cast uses four astragaloi, called tali in Latin. Their short ends are excluded. The four sides are shown numerically as I, III, IV and VI.", "I, III, IV and VI together are Venus. Four I faces are Canis. Other four-of-a-kind throws are Vulture. Any remaining throw with a VI is Senio. The table records casts. Venus ends the match.", "This activity uses a no-stakes race to Venus. The screen approximates the broader faces III and IV as more likely. Real weights depend on the shape and material of the bones."],
      history: "Sheep or goat ankle bones and shaped imitations survive from the ancient Mediterranean. They supported many games of chance and dexterity. The named Venus throw is documented in Roman accounts. This table models a casting activity.",
      sources: [getty, ["The Met · Hellenistic glass astragal", "https://www.metmuseum.org/art/collection/search/249807"], ["Printed study · The Throw of Isis-Aphrodite", "https://journals.sagepub.com/doi/10.1177/03075133221137365"]],
    },
  };
})();
