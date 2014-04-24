//Also included the functions that parses and inserts vcf in Collections
 ParsedVCFs = new Meteor.Collection("vcfs");
 HeadVCFs = new Meteor.Collection("head");
 
 VCFparse=function(x){
	console.log('(parsing a '+x.length+' long string)');
	x=x.split(/\n/);
	var n=x.length; // number of lines in the file
	if(x[n-1].length==0){n=n-1}; // remove trailing blank
	y={head:{},body:{}};
	// parse ## head lines
	var i=0; // ith line
	var L = x[i].match(/^##(.*)/); // L is the line being parsed
	if(L==null){
		throw(x[i]);
	}
	
	while(L.length>1){
		i++;
		L = L[1].match(/([^=]+)\=(.*)/);
		if(!y.head[L[1]]){y.head[L[1]]=[]}
		y.head[L[1]].push(L[2]);
		L = x[i].match(/^##(.*)/);
		if(L==null){L=[]}; // break	
	}
	// parse # body lines
	L=x[i].match(/^#([^#].*)/)[1]; // use fuirst line to define fields
	var F = L.split(/\t/); // fields
	for(var j=0;j<F.length;j++){
		y.body[F[j]]=[];
	}
	var i0=i+1;
	for(var i=i0;i<n;i++){
		L = x[i].split(/\t/);
		for(var j=0;j<F.length;j++){
			y.body[F[j]][i-i0]=L[j];
		}	
	}
	y.fields=F;
	VCFparseHead(y); // parse head further
	for (var xx in y.head){console.log(y.head[xx])};
	console.log('end of function parse');
	console.log('inserting y.head.FORMAT on HeadVCFs Collection')
	
	for (var xx in y.head.FORMAT){
		
        HeadVCFs.insert(y.head.FORMAT[xx]);
    };
	
	return y;
	
	
};

VCFparseHead=function(dt){ // go through a data file and parses data.head
	var fields = Object.getOwnPropertyNames(dt.head);
	var newHead={}; // parse old head into here
	var f, v, str, ID; // place holder for fields, their values, the string line, and IDs during parsing
	var AV, AVk; // attribute=value pairs during parsing of array fields
	for(var i=0;i<fields.length;i++){
		//ID=str.match(/ID=([^\,\>]+)/)[1];
		//dt.head.INFO[ID]={
		// array entries are pushed with <> entries
		f = fields[i];
		if(dt.head[f][0][0]!='<'){ // the non array head fields
			dt.head[f]=dt.head[f][0];
		} else { // the array head fields
			v={};
			for(j=0;j<dt.head[f].length;j++){
				str=dt.head[f][j];
				ID=str.match(/ID=([^\,\>]+)/)[1];
				v[ID]={};
				AV = str.match(/([^\,\<]+=[^\,\>]+)/g);
				for(k=1;k<AV.length;k++){ // k=0 is if ID's AV
					AVk=AV[k].match(/[^=\"]+/g);
					v[ID][AVk[0]]=AVk[1];
				}
			}
			dt.head[f]=v;
		}
	};
	// return dt <-- no need, dt was passed by reference
	
};
