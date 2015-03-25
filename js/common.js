$(document).ready(function(){
	$('body.portfolio .thumbnail img').wrap(function(){
		var alt = this.alt;
		var src = this.src;
		
		return '<a href="' + src + '" title="' + alt + '">' + $(this).text() + '</a>';
	});
});