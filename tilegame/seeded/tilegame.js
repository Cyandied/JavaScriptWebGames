const url = window.location.search;
const urlParams = new URLSearchParams(url);

const gameboard = document.querySelector(".gamearea")
const tile_to_place = document.querySelector("#tile-container")
const game_over_screen = document.querySelector(".game-over")
const game_buttons = document.querySelectorAll(".game-button")
const points_counter = document.querySelector("#point")
const color_select = document.querySelector("#color-select")
const tile_style_sheet = document.querySelector("#tile-style-sheet")
const popup = document.querySelector(".popup")
const discard_counter = document.querySelector("#counter")
const tile_counter = document.querySelector("#tile-counter")
const tile_max = document.querySelector("#tile-max")

const naked_data = {
    "top": 0,
    "bottom": 0,
    "right": 0,
    "left": 0
}

const classes = ["one", "two", "three", "four", "five", "six"]

let round = 0
let points = 0
let tiles_placed = 0
let discard_combo = 0
let help_tiles_placed = 0

const seed = urlParams.get("seed");
const board_control = parseInt(seed.charAt(0));
const block_seeder_control = parseInt(seed.charAt(1)+seed.charAt(2));
let register = [parseInt(seed.charAt(3)),parseInt(2),parseInt(seed.charAt(4)),parseInt(seed.charAt(0)),parseInt(seed.charAt(1))]

const gameboard_size = () => {
    if(board_control < 1){
        return 3;
    } if (board_control < 3){
        return 4;
    } if (board_control < 6){
        return 5;
    } if (board_control < 8){
        return 6;
    } return 7;
}
const gameboard_px_size = window.screen.width <= 1000 ? Math.round(576/7) : 100;

let placed_tiles = [];
let emu_board = [];

const local_location = `board-seeded-${seed}`
const local_storage_board = localStorage.getItem(local_location)

function rand(){
    randnum = register[0];
    newrand = (register[0] + register[1]) % 10
    register.shift()
    register.push(newrand)
    return randnum;
}

function randf(){
    return rand()/10;
}

function randc(){
    c = Math.ceil(6 * randf())
    return c == 0 ? 1 : c;
}

function get_around_emu(row, col){
    top_tile = row-1 > -1 ? row-1 : null;
    bottom_tile = row+1 < gameboard_size() ? row+1 : null;
    right_tile = col+1 < gameboard_size() ? col+1 : null;
    left_tile = col-1 > -1 ? col-1 : null;

    return [[top_tile,col], [bottom_tile,col], [row,right_tile], [row,left_tile]];
}

function get_start_tile(){
    if(block_seeder_control%9 == 0){
        color = randc();
        return tile_type(color,color,color,color);
    } else if (block_seeder_control%5 == 0){
        color1 = randc();
        color2 = randc();
        if(block_seeder_control%2 == 0){
            return tile_type(color1,color2,color2,color1);
        }
        return tile_type(color2,color1,color2,color1);
    } else {
        color1 = randc();
        color2 = randc();
        return tile_type(color1,color1,color2,color2);
    }
}

function get_valid_tile(col, row){
    top_tile = row-1 > -1 ? emu_board[row-1][col] : null;
    bottom_tile = row+1 < gameboard_size() ? emu_board[row+1][col] : null;
    right_tile = col+1 < gameboard_size() ? emu_board[row][col+1] : null;
    left_tile = col-1 > -1 ? emu_board[row][col-1] : null;

    top_c = top_tile == null ? randc() : top_tile.bottom;
    bottom_c = bottom_tile == null ? randc() : bottom_tile.top;
    right_c = right_tile == null ? randc() : right_tile.left;
    left_c = left_tile == null ? randc() : left_tile.right;

    return tile_type(top_c, bottom_c, right_c, left_c);
}

function make_new_board() {
    tile_max.innerHTML = gameboard_size()*gameboard_size()
    for (let row = 0; row < gameboard_size(); row++) {
        const div = document.createElement("div")
        const emu_row = []
        for (let col = 0; col < gameboard_size(); col++) {
            div.style.width = `${gameboard_px_size*gameboard_size()}px`
            div.appendChild(make_tile(naked_data, col, row))
            emu_row.push(null);
        }
        gameboard.appendChild(div)
        emu_board.push(emu_row);
    }
    gameboard.style.height = `${gameboard_px_size*gameboard_size()}px`
    num_start_seeds = block_seeder_control%rand();
    for(let row = 0; row < gameboard_size(); row++){
        for(let col = 0; col < gameboard_size(); col++){
            if (row%2 == 1){
                continue;
            } else if (col%2 == 1) {
                continue
            } else if (rand() <= num_start_seeds){
                continue
            }
            tile = get_start_tile();
            emu_board[row][col] = tile;
        }
    }
    for(let row = 0; row < gameboard_size(); row++){
        for(let col = 0; col < gameboard_size(); col++){
            if (emu_board[row][col] != null){
                continue;
            }
            tile = get_valid_tile(col, row);
            emu_board[row][col] = tile;
        }
    }

    const rand_row = Math.floor(randf()*gameboard_size())
    const rand_col = Math.floor(randf()*gameboard_size())

    place_tile({"row":rand_row, "col":rand_col}, make_tile(emu_board[rand_row][rand_col], rand_col, rand_row))
    emu_board[rand_row][rand_col] = null
}

function make_saved_board(saved_board){
    round = saved_board.round
    points = saved_board.points
    points_counter.innerHTML = points
    tiles_placed = saved_board.tiles_placed
    tile_counter.innerHTML = tiles_placed
    discard_combo = saved_board.discard_combo
    discard_counter.innerHTML = discard_combo
    help_tiles_placed = saved_board.help_tiles_placed
    register = saved_board.register
    placed_tiles = saved_board.placed_tiles
    emu_board = saved_board.emu_board

    tile_max.innerHTML = gameboard_size()*gameboard_size() - discard_combo
    gameboard.style.height = `${gameboard_px_size*gameboard_size()}px`

    for (let row = 0; row < gameboard_size(); row++) {
        const div = document.createElement("div")
        for (let col = 0; col < gameboard_size(); col++) {
            const tile = saved_board.board[row][col]
            const type = tile.type
            const pos = tile.pos
            div.style.width = `${gameboard_px_size*gameboard_size()}px`
            div.appendChild(make_tile(type, pos.col, pos.row))
        }
        gameboard.appendChild(div)
    }
}


if (local_storage_board == null) {
    make_new_board()
}
else if(!JSON.parse(local_storage_board).active){
    make_new_board()
}
else{
    make_saved_board(JSON.parse(local_storage_board))
}

const center = Math.floor(gameboard_size()/2)
gameboard.children[center].children[center].scrollIntoView({ block: "center", inline: "center" })

if (round = 1){
    tile_to_place.appendChild(make_tile(next_placable_tile_type(),null,null))
}
else if(JSON.parse(local_storage_board)?.active){
    const next_tile = JSON.parse(local_storage_board)["next-tile"]
    tile_to_place.appendChild(make_tile(next_tile.type,null, null))
}

color_select.addEventListener("change", e => {
    const tile_style = color_select.value
    tile_style_sheet.setAttribute("href", `../tile_styles/${tile_style}.css`)
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function show_popup(title) {
    const title_part = document.createElement("h2")
    title_part.innerHTML = title
    popup.appendChild(title_part)
    popup.classList.add("display")
    sleep(3000).then(() => {
        popup.classList.remove("display")
        sleep(500).then(() => {
            popup.removeChild(title_part)
        })
    })
}

game_buttons.forEach(button => {
    button.addEventListener("click", e => {
        const action = e.target.dataset.action
        if (action == "rotate") {
            action_rotate_tile()
        }
        else if (action == "discard") {
            action_discard_tile()
        }
        else if (action == "save") {
            action_save()
        }
    })
})

function get_clear_around(row, col){
    const directions = [[-1,0],[+1,0],[0,-1],[0,+1]]
    const placables = []

    directions.forEach(d => {
        const check_row = row + d[0]
        const check_col = col + d[1]
        if(check_row > -1 && check_row < gameboard_size()){
            if(check_col > -1 && check_col < gameboard_size()){
                if(emu_board[check_row][check_col] != null){
                    placables.push([check_row, check_col])
                }
            }
        }
    })
    return placables;
}

function tile_type(top, bottom, right, left) {
    const type = {
        "top": top,
        "bottom": bottom,
        "right": right,
        "left": left
    }
    return type
}

function next_placable_tile_type(){
    if(round == gameboard_size()**2){
        return naked_data;
    }
    let placables = []
    placed_tiles.forEach(p => {
        const placable_for_tile = get_clear_around(p[0],p[1])
        placables = placables.concat(placable_for_tile)
    })
    const tile_pos_to_place = placables[Math.floor(randf()*placables.length)]
    let tile_type = emu_board[tile_pos_to_place[0]][tile_pos_to_place[1]]
    for(let rot = 0; rot < rand(); rot++){
        tile = rotate_tile_data(tile_type);
    }
    emu_board[tile_pos_to_place[0]][tile_pos_to_place[1]] = null
    return tile_type
}

function rotate_tile_data(old_data) {
    const new_data = {
        "top": old_data.left,
        "bottom": old_data.right,
        "right": old_data.top,
        "left": old_data.bottom,
    }
    return new_data
}

function rotate_tile(old_data) {
    const new_data = {
        "top": old_data.left,
        "bottom": old_data.right,
        "right": old_data.top,
        "left": old_data.bottom,
    }
    return make_tile(new_data, null, null)
}

function make_reload_btn() {
    const button = document.createElement("button")
    button.id = "again"
    button.addEventListener("click", e => {
        location.reload()
        localStorage.clear()
    })
    button.innerHTML = "Spil igen?"
    return button
}

function make_back_btn() {
    const button = document.createElement("button")
    button.id = "new-game"
    button.addEventListener("click", e => {
        let href = `selectSeed.html`;
        if(tiles_placed == gameboard_size()**2){
            href = href+`?game=${seed}`
        }
        window.location.href = href;
    })
    button.innerHTML = "Gem spil?"
    return button
}

function display_points(){
    const h1 = document.createElement("h1")
    h1.innerHTML = `Du fik ${points} point!`
    return h1
}

function action_discard_tile() {
    discard_combo++;
    discard_counter.innerHTML = discard_combo
    tile_max.innerHTML = gameboard_size()*gameboard_size() - discard_combo
    if (tiles_placed + discard_combo == gameboard_size()**2) {
        game_over_screen.classList.remove("hidden")
        game_over_screen.appendChild(display_points())
        game_over_screen.appendChild(make_reload_btn())
        return
    }
    tile_to_place.replaceChild(make_tile(next_placable_tile_type(), null, null), tile_to_place.children[0])
}

function action_rotate_tile() {
    const tile = tile_to_place.children[0]
    const type = JSON.parse(tile.dataset.type)
    const rotated_tile = rotate_tile(type)
    tile_to_place.replaceChild(rotated_tile, tile_to_place.children[0])
}

function action_save() {
    const game = []
    const wrap = {}
    const next_tile = tile_to_place.children[0]
    for (let row = 0; row < gameboard.children.length; row++) {
        const game_row = []
        for (let col = 0; col < gameboard.children[row].children.length; col++) {
            const tile = gameboard.children[row].children[col]
            game_row.push({
                "type": JSON.parse(tile.dataset.type),
                "pos": JSON.parse(tile.dataset.pos)
            })
        }
        game.push(game_row)
    }
    wrap["active"] = true
    wrap["board"] = game
    wrap["points"] = points
    wrap["tiles_placed"] = tiles_placed
    wrap["round"] = round
    wrap["discard_combo"] = discard_combo
    wrap["next-tile"] = {"type":JSON.parse(next_tile.dataset.type),"pos":JSON.parse(next_tile.dataset.pos)}
    wrap["help_tiles_placed"] = help_tiles_placed
    wrap["register"] = register
    wrap["placed_tiles"] = placed_tiles
    wrap["emu_board"] = emu_board
    show_popup("Spil gemt!")
    localStorage.setItem(local_location, JSON.stringify(wrap))
}

document.addEventListener("keypress", e => {
    if (e.key == "r") {
        action_rotate_tile()
    }
    else if (e.key == "d") {
        action_discard_tile()
    }
    else if (e.key == "s") {
        action_save()
    }
})

function get_adjacant_tile_info(col, row) {
    let top_tile = 0
    let bot_tile = 0
    let r_tile = 0
    let l_tile = 0
    if (row - 1 >= 0) {
        top_tile = JSON.parse(gameboard.children[row - 1].children[col].dataset.type).bottom
    }
    if (row + 1 < gameboard_size()) {
        bot_tile = JSON.parse(gameboard.children[row + 1].children[col].dataset.type).top
    }
    if (col + 1 < gameboard_size()) {
        r_tile = JSON.parse(gameboard.children[row].children[col + 1].dataset.type).left
    }
    if (col - 1 >= 0) {
        l_tile = JSON.parse(gameboard.children[row].children[col - 1].dataset.type).right
    }

    return { "top": top_tile, "bottom": bot_tile, "right": r_tile, "left": l_tile }
}

function place_tile(target_pos, tile) {
    tiles_placed++;
    tile_counter.innerHTML = tiles_placed
    gameboard.children[target_pos.row].replaceChild(tile, gameboard.children[target_pos.row].children[target_pos.col])
    placed_tiles.push([target_pos.row,target_pos.col])
    if (tiles_placed + discard_combo == gameboard_size()**2) {
        game_over_screen.classList.remove("hidden")
        game_over_screen.appendChild(display_points())
        game_over_screen.appendChild(make_reload_btn())
        game_over_screen.appendChild(make_back_btn())
    }
}

function check_poins(tile_type, adjacent_types) {
    let points = 5
    let touching_tiles = 0
    for (const type in adjacent_types) {
        if (adjacent_types[type] > 0) {
            touching_tiles++;
        }
    }
    if (touching_tiles == 4) {
        touching_tiles += 4
    }
    else if (touching_tiles > 0) {
        touching_tiles--
    }

    if (tiles_placed % 10 == 0) {
        points += 20
    }
    points += check_color_points(tile_type)
    points += touching_tiles * 10
    if (points > 30) {
        show_popup(`${points} point!`)
    }
    return points
}

function check_color_points(tile_type){
    const list_vals = Object.values(tile_type)
    let highest = 0;
    for(const val in list_vals){
        const num_list = list_vals.filter(x => x==list_vals[val])
        const num = num_list.length
        if(num > highest){
            highest = num
        }
    }
    if(highest > 1){
        return highest * 10
    }
    return 0
}


function check_if_can_place(target_type, target_pos) {
    if (JSON.stringify(target_type) != JSON.stringify(naked_data)) {
        show_popup("Du må kun placerer brikker i tomme felter!")
        return
    }
    const tile = tile_to_place.children[0]
    const type = JSON.parse(tile.dataset.type)

    const adjacent_types = get_adjacant_tile_info(target_pos.col, target_pos.row)
    if ((round > 0) == (JSON.stringify(adjacent_types) != JSON.stringify(naked_data))) {
        if (
            (type.top == adjacent_types.top || adjacent_types.top == 0) &&
            (type.bottom == adjacent_types.bottom || adjacent_types.bottom == 0) &&
            (type.right == adjacent_types.right || adjacent_types.right == 0) &&
            (type.left == adjacent_types.left || adjacent_types.left == 0)
        ) {
            round++;
            points += check_poins(type, adjacent_types)
            points_counter.innerHTML = points
            place_tile(target_pos, tile)
            tile_to_place.appendChild(make_tile(next_placable_tile_type(),null,null))
        }
        else {
            show_popup("En eller flere sider macher ikke!")
        }
    }
    else {
        show_popup("Brik skal placeres ved siden af andre brikker!")
    }
}

function make_tile(data, col, row) {
    const tile = document.createElement("div")
    const tile_decoration = document.createElement("div")
    tile.classList.add("tile-wrapper")
    tile_decoration.classList.add("tile")
    tile.dataset.type = JSON.stringify(data)
    tile.dataset.pos = JSON.stringify({ "col": col, "row": row })
    if (JSON.stringify(data) != JSON.stringify(naked_data)) {
        tile_decoration.classList.add(`top-${classes[data.top-1]}`)
        tile_decoration.classList.add(`bottom-${classes[data.bottom-1]}`)
        tile_decoration.classList.add(`right-${classes[data.right-1]}`)
        tile_decoration.classList.add(`left-${classes[data.left-1]}`)
    }
    tile.addEventListener("click", e => {
        const clicked_tile = e.target
        const type = JSON.parse(clicked_tile.dataset.type)
        const pos = JSON.parse(clicked_tile.dataset.pos)
        check_if_can_place(type, pos)
    })
    tile.appendChild(tile_decoration)
    return tile
}



