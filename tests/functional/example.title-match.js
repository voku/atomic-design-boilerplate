describe('Functional testing', function() {
	before(function() {
		casper.start('output/index.html');
	});

	it('Title matches', function() {
		casper.then(function() {
			'Home | Atomic Design Boilerplate'.should.matchTitle;
			
		});
	});
});