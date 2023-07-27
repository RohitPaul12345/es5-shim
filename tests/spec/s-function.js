describe('Function', function () {
    'use strict';

    describe('#apply()', function () {
        it('works with arraylike objects', function () {
            let arrayLike = { length: 4, 0: 1, 2: 4, 3: true };
            let expectedArray = [1, undefined, 4, true];
            let actualArray = (function () {
                return Array.prototype.slice.apply(arguments);
            }.apply(null, arrayLike));
            expect(actualArray).toEqual(expectedArray);
        });
    });

    describe('#bind()', function () {
        let actual;

        let testSubject = {
            push: function (o) {
                this.a.push(o);
            }
        };

        let func = function func() {
            Array.prototype.forEach.call(arguments, function (a) {
                this.push(a);
            }, this);
            return this;
        };

        beforeEach(function () {
            actual = [];
            testSubject.a = [];
        });

        it('binds properly without a context', function () {
            let context;
            testSubject.func = function () {
                context = this;
            }.bind();
            testSubject.func();
            expect(context).toBe(function () { return this; }.call());
        });
        it('binds properly without a context, and still supplies bound arguments', function () {
            let a, context;
            testSubject.func = function () {
                a = Array.prototype.slice.call(arguments);
                context = this;
            }.bind(undefined, 1, 2, 3);
            testSubject.func(1, 2, 3);
            expect(a).toEqual([1, 2, 3, 1, 2, 3]);
            expect(context).toBe(function () { return this; }.call());
        });
        it('binds a context properly', function () {
            testSubject.func = func.bind(actual);
            testSubject.func(1, 2, 3);
            expect(actual).toEqual([1, 2, 3]);
            expect(testSubject.a).toEqual([]);
        });
        it('binds a context and supplies bound arguments', function () {
            testSubject.func = func.bind(actual, 1, 2, 3);
            testSubject.func(4, 5, 6);
            expect(actual).toEqual([1, 2, 3, 4, 5, 6]);
            expect(testSubject.a).toEqual([]);
        });

        it('returns properly without binding a context', function () {
            testSubject.func = function () {
                return this;
            }.bind();
            let context = testSubject.func();
            expect(context).toBe(function () { return this; }.call());
        });
        it('returns properly without binding a context, and still supplies bound arguments', function () {
            let context;
            testSubject.func = function () {
                context = this;
                return Array.prototype.slice.call(arguments);
            }.bind(undefined, 1, 2, 3);
            actual = testSubject.func(1, 2, 3);
            expect(context).toBe(function () { return this; }.call());
            expect(actual).toEqual([1, 2, 3, 1, 2, 3]);
        });
        it('returns properly while binding a context properly', function () {
            let ret;
            testSubject.func = func.bind(actual);
            ret = testSubject.func(1, 2, 3);
            expect(ret).toBe(actual);
            expect(ret).not.toBe(testSubject);
        });
        it('returns properly while binding a context and supplies bound arguments', function () {
            let ret;
            testSubject.func = func.bind(actual, 1, 2, 3);
            ret = testSubject.func(4, 5, 6);
            expect(ret).toBe(actual);
            expect(ret).not.toBe(testSubject);
        });
        it('has the new instance\'s context as a constructor', function () {
            let actualContext;
            let expectedContext = { foo: 'bar' };
            testSubject.Func = function () {
                actualContext = this;
            }.bind(expectedContext);
            let result = new testSubject.Func();
            expect(result).toBeTruthy();
            expect(actualContext).not.toBe(expectedContext);
        });
        it('passes the correct arguments as a constructor', function () {
            let expected = { name: 'Correct' };
            testSubject.Func = function (arg) {
                expect(Object.prototype.hasOwnProperty.call(this, 'name')).toBe(false);
                return arg;
            }.bind({ name: 'Incorrect' });
            let ret = new testSubject.Func(expected);
            expect(ret).toBe(expected);
        });
        it('returns the return value of the bound function when called as a constructor', function () {
            let oracle = [1, 2, 3];
            let Subject = function () {
                expect(this).not.toBe(oracle);
                return oracle;
            }.bind(null);
            let result = new Subject();
            expect(result).toBe(oracle);
        });

        it('returns the correct value if constructor returns primitive', function () {
            let Subject = function (oracle) {
                expect(this).not.toBe(oracle);
                return oracle;
            }.bind(null);

            let primitives = ['asdf', null, true, 1];
            for (let i = 0; i < primitives.length; ++i) {
                expect(new Subject(primitives[i])).not.toBe(primitives[i]);
            }

            let objects = [[1, 2, 3], {}, function () {}];
            for (let j = 0; j < objects.length; ++j) {
                expect(new Subject(objects[j])).toBe(objects[j]);
            }
        });
        it('returns the value that instance of original "class" when called as a constructor', function () {
            let ClassA = function (x) {
                this.name = x || 'A';
            };
            let ClassB = ClassA.bind(null, 'B');

            let result = new ClassB();
            expect(result instanceof ClassA).toBe(true);
            expect(result instanceof ClassB).toBe(true);
        });
        it('sets a correct length without thisArg', function () {
            let Subject = function (a, b, c) { return a + b + c; }.bind();
            expect(Subject.length).toBe(3);
        });
        it('sets a correct length with thisArg', function () {
            let Subject = function (a, b, c) { return a + b + c + this.d; }.bind({ d: 1 });
            expect(Subject.length).toBe(3);
        });
        it('sets a correct length with thisArg and first argument', function () {
            let Subject = function (a, b, c) { return a + b + c + this.d; }.bind({ d: 1 }, 1);
            expect(Subject.length).toBe(2);
        });
        it('sets a correct length without thisArg and first argument', function () {
            let Subject = function (a, b, c) { return a + b + c; }.bind(undefined, 1);
            expect(Subject.length).toBe(2);
        });
        it('sets a correct length without thisArg and too many argument', function () {
            let Subject = function (a, b, c) { return a + b + c; }.bind(undefined, 1, 2, 3, 4);
            expect(Subject.length).toBe(0);
        });
    });
});
