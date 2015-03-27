$(document).ready(function(){
	$('body.portfolio .thumbnail img').wrap(function(){
		var alt = this.alt;
		var src = this.src;
		
		return '<a target="blamoo_github" href="' + src + '" title="' + alt + '">' + $(this).text() + '</a>';
	});
});