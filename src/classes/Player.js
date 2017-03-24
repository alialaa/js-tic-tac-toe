import Board from './Board';

/**
  * @desc This class represents the computer player, contains a single method that uses minimax to get the best move
  * @param {Number} max_depth - limits the depth of searching
  * @param {Map} nodes_map - stores the heuristic values for each possible move
*/
class Player {
	constructor(max_depth = -1) {
        this.max_depth = max_depth;
        this.nodes_map = new Map();
    }
    /**
     * Uses minimax algorithm to get the best move
     * @param {Object} board - an instant of the board class
     * @param {Boolean} maximizing - whether the player is a maximizing or a minimizing player
     * @param {Function} callback - a function to run after the best move calculation is done
     * @param {Number} depth - used internally in the function to increment the depth each recursive call
     * @return {Number} the index of the best move
     */
	getBestMove(board, maximizing = true, callback = () => {}, depth = 0) {
		//Throw an error if the first argument is not a board
		if(board.constructor.name !== "Board") throw('The first argument to the getBestMove method should be an instance of Board class.');
		//Decides whether to log each tree iteration to the console
		const TRACE = window.trace_ttt; 
		//clear nodes_map if the function is called for a new move
		if(depth == 0) this.nodes_map.clear();

		//If the board state is a terminal one, return the heuristic value
		if(board.isTerminal() || depth == this.max_depth ) {
			if(board.isTerminal().winner == 'x') {
				return 100 - depth;
			} else if (board.isTerminal().winner == 'o') {
				return -100 + depth;
			} 
			return 0;
		}

		//Defining some styles for console logging
		const console_styles = {
			turn_and_available_moves: 'background: #7f3192; color: #fff; font-size:14px;padding: 0 5px;',
			exploring_parent: 'background: #353535;color: #fff;padding: 0 5px;font-size:18px',
			exploring_child: 'background: #f03;color: #fff;padding: 0 5px',
			parent_heuristic: 'background: #26d47c; color: #fff; font-size:14px;padding: 0 5px;',
			child_heuristic: 'background: #5f9ead; color: #fff; font-size:14px;padding: 0 5px;',
			all_moves: 'background: #e27a50;color: #fff;padding: 0 5px;font-size:14px',
			best_move: 'background: #e8602a;color: #fff;padding: 0 5px;font-size:18px'
		};
		//Destructuring Styles
		const {turn_and_available_moves, exploring_parent, exploring_child, child_heuristic, parent_heuristic, all_moves, best_move} = console_styles;

		//Console Tracing Code
		if(TRACE) {
			let p = maximizing ? 'Maximizing' : 'Minimizing';
			console.log(`%c${p} player's turn Depth: ${depth}`, turn_and_available_moves);
			console.log(`%cAvailable Moves: ${board.getAvailableMoves().join(' ')}`, turn_and_available_moves);
			if(depth == 0) board.printFormattedBoard();
		}

		//Current player is maximizing
		if(maximizing) {
			//Initializ best to the lowest possible value
			let best = -100;
			//Loop through all empty cells
			board.getAvailableMoves().forEach(index => {
				//Initialize a new board with the current state (slice() is used to create a new array and not modify the original)
				let child = new Board(board.state.slice());
				//Create a child node by inserting the maximizing symbol x into the current emoty cell
				child.insert('x', index);

				//Console Tracing Code
				if(TRACE) {
					let styles = (depth == 0) ? exploring_parent : exploring_child;
					console.log(`%cExploring move ${index}`, styles);
					child.printFormattedBoard();
				}

				//Recursively calling getBestMove this time with the new board and minimizing turn and incrementing the depth
				let node_value = this.getBestMove(child, false, callback, depth + 1);
				//Updating best value
				best = Math.max(best, node_value);

				//Console Tracing Code
				if(TRACE) {
					if(depth == 0) {
						console.log(`%cMove ${index} yielded a heuristic value of ${node_value}`, parent_heuristic);
					} else {
						console.log(`%cChild move ${index} yielded a heuristic value of ${node_value}`, child_heuristic);
					}
				}
				
				//If it's the main function call, not a recursive one, map each heuristic value with it's moves indicies
				if(depth == 0) {
					//Comma seperated indicies if multiple moves have the same heuristic value
					var moves = this.nodes_map.has(node_value) ? `${this.nodes_map.get(node_value)},${index}` : index;
					this.nodes_map.set(node_value, moves);
				}
			});
			//If it's the main call, return the index of the best move or a random index if multiple indicies have the same value
			if(depth == 0) {
				if(typeof this.nodes_map.get(best) == 'string') {
					var arr = this.nodes_map.get(best).split(',');
					var rand = Math.floor(Math.random() * arr.length);
					var ret = arr[rand];
				} else {
					ret = this.nodes_map.get(best);
				}
				//Console Tracing Code
				if(TRACE) {
					this.nodes_map.forEach((index,value) => {
						console.log(`%cMove(s) ${index} yielded ${value}`, all_moves);
					});
					console.log(`%cMove ${ret} was decided as the best move`, best_move);
				}
				//run a callback after calculation and return the index
				callback(ret);
				return ret;
			}
			//If not main call (recursive) return the heuristic value for next calculation
			return best;
		}

		if(!maximizing) {
			//Initializ best to the highest possible value
			let best = 100;
			//Loop through all empty cells
			board.getAvailableMoves().forEach(index => {
				//Initialize a new board with the current state (slice() is used to create a new array and not modify the original)
				let child = new Board(board.state.slice());
				//Create a child node by inserting the minimizing symbol o into the current emoty cell
				child.insert('o', index);

				//Console Tracing Code
				if(TRACE) {
					let styles = (depth == 0) ? exploring_parent : exploring_child; 
					console.log(`%cExploring move ${index}`, styles);
					child.printFormattedBoard();
				}
			
				//Recursively calling getBestMove this time with the new board and maximizing turn and incrementing the depth
				let node_value = this.getBestMove(child, true, callback, depth + 1);
				//Updating best value
				best = Math.min(best, node_value);

				//Console Tracing Code
				if(TRACE) {
					if(depth == 0) {
						console.log(`%cMove ${index} yielded a heuristic value of ${node_value}`, parent_heuristic);
					} else {
						console.log(`%cChild move ${index} yielded a heuristic value of ${node_value}`, child_heuristic);
					}
				}
				
				//If it's the main function call, not a recursive one, map each heuristic value with it's moves indicies
				if(depth == 0) {
					//Comma seperated indicies if multiple moves have the same heuristic value
					var moves = this.nodes_map.has(node_value) ? this.nodes_map.get(node_value) + ',' + index : index;
					this.nodes_map.set(node_value, moves);
				}
			});
			//If it's the main call, return the index of the best move or a random index if multiple indicies have the same value
			if(depth == 0) {
				if(typeof this.nodes_map.get(best) == 'string') {
					var arr = this.nodes_map.get(best).split(',');
					var rand = Math.floor(Math.random() * arr.length);
					var ret = arr[rand];
				} else {
					ret = this.nodes_map.get(best);
				}
				//Console Tracing Code
				if(TRACE) {
					this.nodes_map.forEach((index,value) => {
						console.log(`%cMove(s) ${index} yielded ${value}`, all_moves);
					});
					console.log(`%cMove ${ret} was decided as the best move`, best_move);
				}
				//run a callback after calculation and return the index
				callback(ret);
				return ret;
			}
			//If not main call (recursive) return the heuristic value for next calculation
			return best;
		}

	}
}

export default Player;