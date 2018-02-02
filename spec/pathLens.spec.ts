import * as l from '../index';

describe('Path Lens', () => {
    it('does not mutate input object when setting new value', () => {
        const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
        const lens = l.lensFromPath(path, [1, 0]);
        const inputData = data();
        const originalData = data();

        lens.set(inputData, 'Updated Attribute 1');

        expect(inputData).toEqual(originalData);
    });

    describe('Lens from path without indexes', () => {
        it('can get value', () => {
            const path = l.pathFromExpression((d: IData) => d.list.items);
            const lens = l.lensFromPath(path);

            expect(lens.get(data())).toEqual(data().list.items);
        });

        it('can set value', () => {
            const path = l.pathFromExpression((d: IData) => d.list.items);
            const lens = l.lensFromPath(path);

            const actualData = lens.set(data(), [{ name: 'New item' }]);

            const expectedData = data();
            expectedData.list.items = [{name: 'New item'}];
            expect(actualData).toEqual(expectedData);
        });
    });

    describe('Lens from path with static array indexes', () => {
        it('can get value', () => {
            const path = l.pathFromExpression((d: IData) => d.list.items[1].attributes![0]);
            const lens = l.lensFromPath(path);

            expect(lens.get(data())).toEqual('Attribute 1');
        });

        it('can set value', () => {
            const path = l.pathFromExpression((d: IData) => d.list.items[1].attributes![0]);
            const lens = l.lensFromPath(path);

            const actualData = lens.set(data(), 'Updated Attribute 1');

            const expectedData = data();
            expectedData.list.items[1]!.attributes![0] = 'Updated Attribute 1';
            expect(actualData).toEqual(expectedData);
        });
    });

    describe('Lens from path with variable indexes', () => {
        describe('Variable array indexes', () => {
            it('can get value', () => {
                const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
                const lens = l.lensFromPath(path, [1, 0]);

                expect(lens.get(data())).toEqual('Attribute 1');
            });

            it('can set value', () => {
                const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
                const lens = l.lensFromPath(path, [1, 0]);

                const actualData = lens.set(data(), 'Updated Attribute 1');

                const expectedData = data();
                expectedData.list.items[1].attributes![0] = 'Updated Attribute 1';
                expect(actualData).toEqual(expectedData);
            });
        });

        describe('Variable object attributes', () => {
            it('can get value by string key', () => {
                const path = l.pathFromExpression((d: IData, authorKey: string) => d.list[authorKey].firstName);
                const lens = l.lensFromPath(path, ['secondAuthor']);

                expect(lens.get(data())).toEqual('John');
            });

            it('can set value by string key', () => {
                const path = l.pathFromExpression((d: IData, authorKey: string) => d.list[authorKey].firstName);
                const lens = l.lensFromPath(path, ['secondAuthor']);

                const actualData = lens.set(data(), 'Updated John');

                const expectedData = data();
                expectedData.list.secondAuthor.firstName = 'Updated John';
                expect(actualData).toEqual(expectedData);
            });

            it('can get value by number key when used with \'objectKey\' hint', () => {
                const path = l.pathFromExpression((d: IData, languageCodeId: number) => d.list.items[0].localizedName![languageCodeId]);
                const lens = l.lensFromPath(path, [l.objectKey(1029)]);

                expect(lens.get(data())).toEqual('First item');
            });

            it('can set value by number key when used with \'objectKey\' hint' , () => {
                const path = l.pathFromExpression((d: IData, languageCodeId: number) => d.list.items[0].localizedName![languageCodeId]);
                const lens = l.lensFromPath(path, [l.objectKey(1029)]);

                const actualData = lens.set(data(), 'First item - updated');

                const expectedData = data();
                expectedData.list.items[0].localizedName![1029] = 'First item - updated';
                expect(actualData).toEqual(expectedData);
            });
        })

        it('throws error on attempt to create a lens without passing values of variable indexes for a path containing variable indexes', () => {
            const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
            expect(() => l.lensFromPath(path))
            .toThrow(new Error('The path contains variable indexes however no values for the indexes were passed in the second argument.'));
        });

        it('throws error on attempt to create a lens by passing empty values of variable indexes for a path containing variable indexes', () => {
            const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
            expect(() => l.lensFromPath(path, []))
            .toThrow(new Error('The path contains variable indexes however no values for the indexes were passed in the second argument.'));
        });

        it('throws error on attempt to create a lens by passing incomplete values of variable indexes for a path containing variable indexes', () => {
            const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
            expect(() => l.lensFromPath(path, [1]))
            .toThrow(new Error('The path contains 2 variable index(es) however 1 value(s) for the indexes were passed in the second argument.'));
        });

        it('throws error on attempt to create a lens by passing incomplete values of variable indexes for a path containing variable indexes', () => {
            const path = l.pathFromExpression((d: IData, i: number, j: number) => d.list.items[i].attributes![j]);
            expect(() => l.lensFromPath(path, [1, 3, 5]))
            .toThrow(new Error('The path contains 2 variable index(es) however 3 value(s) for the indexes were passed in the second argument.'));
        });
    });

    describe('Lens for root array', () => {
        it('can get value', () => {
            const path = l.pathFromExpression((items: IItem[]) => items[1].attributes![0]);
            const lens = l.lensFromPath(path);

            expect(lens.get(data().list.items)).toEqual('Attribute 1');
        });

        it('can set value', () => {
            const path = l.pathFromExpression((items: IItem[]) => items[1].attributes![0]);
            const lens = l.lensFromPath(path);

            const actualData = lens.set(data().list.items, 'Updated Attribute 1');

            const expectedData = data().list.items;
            expectedData[1].attributes![0] = 'Updated Attribute 1';
            expect(actualData).toEqual(expectedData);
        });
    });

});

describe('Path Parser', () => {
    it('can create path from an untyped arrow expression', () => {
        const path = l.pathFromExpression((d: any, i) => d[2].foo.bar[i].baz[5]);

        const actualPath = JSON.stringify(path); // Workaround for jasmine array comparison bug (https://github.com/jasmine/jasmine/issues/786)
        const expectedPath = JSON.stringify([{index: 2}, {attribute: 'foo'}, {attribute: 'bar'}, {variableIndexPosition: 0}, {attribute: 'baz'}, {index: 5}]);
        expect(actualPath).toEqual(expectedPath);
    });

    it('can create path from an untyped function expression', () => {
        const path = l.pathFromExpression(function (d: any, i) { return d[2].foo.bar[i].baz[5]; });

        const actualPath = JSON.stringify(path);
        const expectedPath = JSON.stringify([{index: 2}, {attribute: 'foo'}, {attribute: 'bar'}, {variableIndexPosition: 0}, {attribute: 'baz'}, {index: 5}]);
        expect(actualPath).toEqual(expectedPath);
    });

    it('can create path from an typed arrow expression', () => {
        const path = l.pathFromExpression((d: IData, i: number) => d.list.items[i].name);

        const actualPath = JSON.stringify(path);
        const expectedPath = JSON.stringify([{attribute: 'list'}, {attribute: 'items'}, {variableIndexPosition: 0}, {attribute: 'name'}]);
        expect(actualPath).toEqual(expectedPath);
    });

    it('even works with arrow functions with return inside', () => {
        const path = l.pathFromExpression((d: IData, i: number) => {
            return d.list.items[i].name
        });

        const actualPath = JSON.stringify(path);
        const expectedPath = JSON.stringify([{ attribute: 'list' }, { attribute: 'items' }, { variableIndexPosition: 0 }, { attribute: 'name' }]);
        expect(actualPath).toEqual(expectedPath);
    })
});

interface IData {
    list: IListData;
}

interface IListData {
    [ key: string ]: any;
    items: IItem[];
    firstAuthor: IAuthor;
    secondAuthor: IAuthor;
}

interface IItem {
    name: string;
    localizedName?: { [languageCodeId: number]: string };
    attributes?: string[];
}

interface IAuthor {
    firstName: string;
    lastName: string;
}

function data(): IData {
    return {
        list: {
            items: [
                { name: 'First Item Name', localizedName: { 1029: 'First item' } },
                { name: 'Second Item Name', attributes: ['Attribute 1', 'Attribute 2'] }
            ],
            firstAuthor: {
                firstName: 'Alice',
                lastName: 'Bar'
            },
            secondAuthor: {
                firstName: 'John',
                lastName: 'Foo'
            }
        }
    };
};
