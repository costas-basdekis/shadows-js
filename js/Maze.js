"use strict";

class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.points = Array.from({length: this.height},
            () => Array.from({length: this.width}, () => false));
        this.verticalWalls = Array.from({length: this.height},
            () => Array.from({length: this.width - 1}, () => true));
        this.horizontalWalls = Array.from({length: this.height - 1},
            () => Array.from({length: this.width}, () => true));

        this.generate();
    }

    toString() {
        const verticalWallsRows = zip(this.points, this.verticalWalls)
            .map(([points, walls]) =>
                zip(points, walls.concat([true])).map(
                    ([point, wall]) => `${point ? ' ' : 'x'}${wall ? '|' : ' '}`
                ).join(''));
        const horizontalWallsRows = this.horizontalWalls.map(walls =>
            walls.map(wall =>
                `${wall ?  '-' : ' '} `
            ).join(''));
        return zip(verticalWallsRows, horizontalWallsRows.concat(['']))
            .map(([v, h]) => `|${v}\n ${h}`).join('\n');
    }

    generate() {
        const start = {
            x: Math.floor(this.width / 2),
            y: Math.floor(this.width / 2),
        };

        const border = [start];
        this.takePoint(start);
        // console.log(`Seeding with ${start.x}x${start.y}:\n${this}`);
        while (border.length) {
            const point = randomPop(border);
            // console.log(`Got ${point.x}x${point.y}`);
            const unclaimedNeighboursAndWalls =
                this.getUnclaimedNeighboursAndWalls(point);
            // console.log(`Got unclaimed neighbours: ${unclaimedNeighboursAndWalls.map(([p, _1, _2]) => `${p.x}x${p.y}`)}`);
            if (!unclaimedNeighboursAndWalls.length) {
                continue;
            }

            const [nextPoint, nextVerticalWall, nextHorizontalWall] =
                randomPop(unclaimedNeighboursAndWalls);
            // console.log(`Claim ${nextPoint.x}x${nextPoint.y}`);
            this.takePoint(nextPoint);
            if (nextVerticalWall) {
                this.openVerticalWall(nextVerticalWall);
            } else {
                this.openHorizontalWall(nextHorizontalWall);
            }
            border.push(nextPoint);

            // console.log(`Maze now is:\n${this}`);

            if (unclaimedNeighboursAndWalls.length) {
                border.push(point);
            }
        }
    }

    getUnclaimedNeighboursAndWalls(point) {
        const neighboursAndWalls = this.getNeighboursAndWalls(point);
        // console.log(`Neighbours of ${point.x}x${point.y}: ${neighboursAndWalls.map(([p, _]) => `${p.x}x${p.y}`)}`);
        const unclaimedNeighboursAndWalls = neighboursAndWalls
            .filter(([point, _1, _2]) => !this.pointIsTaken(point));
        return unclaimedNeighboursAndWalls;
    }

    getNeighboursAndWalls(point) {
        const neighboursAndWalls = [
            [{x: point.x - 1, y: point.y}, {x: point.x - 1, y: point.y}, null],
            [{x: point.x + 1, y: point.y}, {x: point.x, y: point.y}, null],
            [{x: point.x, y: point.y - 1}, null, {x: point.x, y: point.y - 1}],
            [{x: point.x, y: point.y + 1}, null, {x: point.x, y: point.y}],
        ];
        // console.log(`Trying neighbours of ${point.x}x${point.y}: ${neighboursAndWalls.map(([p, _]) => `${p.x}x${p.y}`)}`);
        const existingNeighboursAndWalls = neighboursAndWalls
            .filter(([point, _1, _2]) => this.pointExists(point));
        return existingNeighboursAndWalls;
    }

    pointExists(point) {
        // console.log(`Exists ${point.x}x${point.y}? ${point.x >= 0} && ${point.x < this.width}
        //         && ${point.y >= 0} && ${point.y < this.height}`)
        return point.x >= 0 && point.x < this.width
                && point.y >= 0 && point.y < this.height;
    }

    takePoint(point) {
        this.points[point.y][point.x] = true;
    }

    pointIsTaken(point) {
        return this.points[point.y][point.x];
    }

    openVerticalWall(wall) {
        this.verticalWalls[wall.y][wall.x] = false;
    }

    openHorizontalWall(wall) {
        this.horizontalWalls[wall.y][wall.x] = false;
    }

    verticalWallIsClosed(wall) {
        return this.verticalWalls[wall.y][wall.x];
    }

    horizontalWallIsClosed(wall) {
        return this.horizontalWalls[wall.y][wall.x];
    }

    toCoordinatesLists(size, offsetX=0, offsetY=0) {
        const borderList = [].concat(
            // Top, going right: [0, 0] -> [width - 1, 0]
            range(this.width)
                .map(index => [index, 0]),
            // Right, going down: [width, 0] - > [width, height - 1]
            range(this.height)
                .map(index => [this.width, index]),
            // Bottom, going left: [width, height] -> [1, height]
            range(this.width, 0, -1)
                .map(index => [index, this.height]),
            // Left, going up: [0, height] -> [0, 1]
            range(this.height, 0, -1)
                .map(index => [0, index])
        );
        borderList.push(borderList[0]);
        const verticalWallsLists =
            cartesian(range(this.width - 1), range(this.height))
                .filter(([x, y]) => this.verticalWallIsClosed({x, y}))
                .map(([x, y]) => [[x + 1, y], [x + 1, y + 1]]);
        const horizontalWallsLists =
            cartesian(range(this.width), range(this.height - 1))
                .filter(([x, y]) => this.horizontalWallIsClosed({x, y}))
                .map(([x, y]) => [[x, y + 1], [x + 1, y + 1]]);
        const lists = [].concat(
            [borderList], verticalWallsLists, horizontalWallsLists);
        const coordinatesLists = lists
            .map(list => list
                .map(([x, y]) => [offsetX + x * size, offsetY + y * size]));

        return coordinatesLists;
    }
}
