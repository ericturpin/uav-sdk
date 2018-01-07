class IAnalyser {
	constructor() {
		this.mask = 'classification';		
	}

	random() {
		return this.hsv2rgb([360 * Math.random(), 1, 1]);
	}

	zero(n) {
	    let m = [];
	    
	    for (let i = 0; i < n; i++)
	        m.push(0);
	    
	    return m;
	}
	
	rgb2hsv(rgb) {
		var hsv = [ 0, 0, 0 ];
		
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		
		var cmax = Math.max(r, g, b);
		var cmin = Math.min(r, g, b);
		
		var delta = cmax - cmin;
		
		// compute the HUE
		if (0 === delta)
			hsv[0] = 0;
		else if (cmax === r)
			hsv[0] = 60 * (((g - b) / delta) % 6);
		else if (cmax === g)
			hsv[0] = 60 * (((b - r) / delta) + 2);
		else if (cmax === b)
			hsv[0] = 60 * (((r - g) / delta) + 4);
		
		// compute the SATURATION
		hsv[1] = 0 === cmax ? 0 : (delta / cmax);
		
		// compute the VALUE
		hsv[2] = cmax;
		
		return hsv;
	}

	hsv2rgb(hsv) {
		var rgb = [ 0, 0, 0 ];
		
		var max = 255 * hsv[2];
		var min = max * (1 - hsv[1]);
		var z = (max - min) * (1 - Math.abs( ((hsv[0] / 60.0) % 2) - 1 ));
		
		if (hsv[0] < 60) 
		{
			rgb[0] = max;
			rgb[1] = z + min;
			rgb[2] = min;
		}
		else if (hsv[0] < 120) 
		{
			rgb[0] = z + min;
			rgb[1] = max;
			rgb[2] = min;
		}
		else if (hsv[0] < 180) 
		{
			rgb[0] = min;
			rgb[1] = max;
			rgb[2] = z + min;
		}
		else if (hsv[0] < 240) {
			rgb[0] = min;
			rgb[1] = z + min;
			rgb[2] = max;
		}
		else if (hsv[0] < 300) {
			rgb[0] = z + min;
			rgb[1] = min;
			rgb[2] = max;
		}
		else if (hsv[0] < 361) {
			rgb[0] = max;
			rgb[1] = min;
			rgb[2] = z + min;
		}
		
		return rgb;
	}
	
	compute_histogram_RGB(data) {
	    let size = data.length;    
	    
	    let histo_r = this.zero(255);
	    let histo_g = this.zero(255);
	    let histo_b = this.zero(255);
	    
	    for (let i = 0; i < size; i += 4)
	    {
	        let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	        
	        histo_r[ r ] += 1;
	        histo_g[ g ] += 1;
	        histo_b[ b ] += 1
	    }
	    
	    return [ histo_r, histo_b, histo_b ];
	}
	
	setMask(mask) {
		this.mask = mask;
	}
	
	process(data, options) {
		let process = this.processing ? this.processing : this.mask;
		
		switch(process) 
		{
			case 'rgb': this.process_rgb(data, options); break;
			case 'red': this.process_red(data, options); break;
			case 'green': this.process_green(data, options); break;
			case 'blue': this.process_blue(data, options); break;
			case 'gray': this.process_gray(data, options); break;
			case 'grayscale': this.process_grayscale(data, options); break;	
			case 'vegetation': this.process_vegetation(data, options); break;	
			case 'roads': this.process_roads(data, options); break;
			case 'buildings': this.process_buildings(data, options); break;
			case 'water': this.process_water(data, options); break;	
			case 'classification': this.process_classification(data, options); break;
		}
	}
	
	process_rgb(data, options) {
	    let size = data.length;    
	    let histograms = options && options.histograms;
	    
	    for (let i = 0; i < size; i += 4)
	    {
	        let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	     
	        data[ i ] = r;
	        data[ i + 1 ] = g;
	        data[ i + 2 ] = b;
	       
	        if (histograms)
	        {
	        	histograms[0][ r ] += 1;
	        	histograms[1][ g ] += 1;
	        	histograms[2][ b ] += 1;
	        }
	    }
	}
	
	process_grayscale(data, options) {
	    let size = data.length;    
	    let histogram = options && options.histogram;
	    
	    for (let i = 0; i < size; i += 4)
	    {
	        let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	     
	        let hsv = this.rgb2hsv([ r, g, b ]);
	        
	        let gray = 255 * hsv[2];
	        
	        data[ i ] = gray;
	        data[ i + 1 ] = gray;
	        data[ i + 2 ] = gray;
	       
	        if (histogram)
	        	histogram[ gray ] += 1;
	    }
	}
	
	process_red(data, options) {
	    let size = data.length;    
	    
	    for (let i = 0; i < size; i += 4)
	    {
	    	let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	        
	        let max_gb = Math.max(g, b);
	        
	        if (max_gb < r)
	        {
	        	let d = r - max_gb;
	        	
	        	if (5 > d)
	        	{
	        		data[ i ] = 0;
			        data[ i + 1 ] = 0;
			        data[ i + 2 ] = 0;
	        	}
	        }
	        else
	        {
	        	data[ i ] = 0;
		        data[ i + 1 ] = 0;
		        data[ i + 2 ] = 0;
	        }
	    }
	}
	
	process_green(data, options) {
	    let size = data.length;    
	    
	    for (let i = 0; i < size; i += 4)
	    {
	    	let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	        
	        let max_rb = Math.max(r, b);
	        
	        if (max_rb < g)
	        {
	        	let d = g - max_rb;
	        	
	        	if (5 > d)
	        	{
	        		data[ i ] = 0;
			        data[ i + 1 ] = 0;
			        data[ i + 2 ] = 0;
	        	}
	        }
	        else
	        {
	        	data[ i ] = 0;
		        data[ i + 1 ] = 0;
		        data[ i + 2 ] = 0;
	        }
	    }
	}
	
	process_blue(data, options) {
	    let size = data.length;    
	    
	    for (let i = 0; i < size; i += 4)
	    {
	    	let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	        
	        let min_gb = Math.min(g, b);
	        
	        if (r < min_gb)
	        {
	        	let dist_r_gb = min_gb - r;
	        	let dist_gb = b - g;
	        	
	        	if (dist_gb < 0 || dist_r_gb < 50)
	        	{
	        		data[ i ] = 0;
			        data[ i + 1 ] = 0;
			        data[ i + 2 ] = 0;
	        	}
	        }
	        else
	        {
	        	data[ i ] = 0;
		        data[ i + 1 ] = 0;
		        data[ i + 2 ] = 0;
	        }
	    }
	}
	
	process_gray(data, options) {
	    let size = data.length;    
	    
	    for (let i = 0; i < size; i += 4)
	    {
	    	let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	        
	        let center = 0.5 * (g + b);
	        let dist_gb = b - g;
	        let dist_rc = center - r;
	        
	        if (!(r <= Math.min(b, g) && -3 < dist_gb && dist_gb < 10 && b < 164))
	        {
	        	data[ i ] = 0;
			    data[ i + 1 ] = 0;
			    data[ i + 2 ] = 0;
	        }
	    }
	}
	
	process_vegetation(data, options) {
	    let size = data.length;    
	    let histogram = options && options.histogram;
	  
	    this.process_green(data, options);
	    
	    for (let i = 0; i < size; i += 4)
	    {
	    	let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	        
	        let max_rb = Math.max(r, b);
	        
	        if (max_rb < g)
	        {
	        	let d = g - max_rb;
	        	
	        	if (5 > d)
	        	{
	        		data[ i ] = 0;
			        data[ i + 1 ] = 0;
			        data[ i + 2 ] = 0;
	        	}
	        	else
	        	{
	        		let hsv = this.rgb2hsv([ r, g, b ]);
	    	        let value = hsv[2];
	    	        
	    	        if (value < 0.33)														// hight vegetation
	    	        {
	    	            data[ i ] = 0;
	    	            data[ i + 1 ] = 75;
	    	            data[ i + 2 ] = 0;
	    	        }
	    	        else if (0.33 <= value && value < 0.36)									// middle vegetation
	    	        {   
	    	            data[ i ] = 0;
	    	            data[ i + 1 ] = 150;
	    	            data[ i + 2 ] = 0;
	    	        }
	    	        else if (0.36 <= value && value < 0.50)									// low vegetation
	    	        {   
	    	            data[ i ] = 200;
	    	            data[ i + 1 ] = 255;
	    	            data[ i + 2 ] = 200;
	    	        }
	    	        
	    	        if (histogram)
	    	        	histogram[ g ] += 1;
	        	}
	        }
	        else
	        {
	        	data[ i ] = 0;
		        data[ i + 1 ] = 0;
		        data[ i + 2 ] = 0;
	        }
	    }
	}
	
	process_buildings(data, options) {
	    this.process_red(data, options);
	}
	
	process_roads(data, options) {
	    this.process_gray(data, options);
	}
	
	process_water(data, options) {
	    this.process_blue(data, options);
	}
	
	process_classification(data, options) {
	    let size = data.length;    
	    
	    for (let i = 0; i < size; i += 4)
	    {
	        let r = data[ i ];
	        let g = data[ i + 1 ];
	        let b = data[ i + 2 ];
	     
	        let hsv = this.rgb2hsv([ r, g, b ]);
	        let gray = 255 * hsv[2];
	            
	        data[ i ] = gray;
	        data[ i + 1 ] = gray;
	        data[ i + 2 ] = gray;
	        
	        if (44 < gray && gray < 86)												// hight vegetation
	        {
	            data[ i ] = 0;
	            data[ i + 1 ] = 85;
	            data[ i + 2 ] = 0;
	        }
	        else if (86 < gray && gray < 116)										// light vegetation
	        {   
	            data[ i ] = 0;
	            data[ i + 1 ] = 200;
	            data[ i + 2 ] = 0;
	        }
	        else if (129 < gray && gray < 148)										// roads
	        {
	            data[ i ] = 0;
	            data[ i + 1 ] = 0;
	            data[ i + 2 ] = 255;
	        }
	        else if (160 < gray && gray < 181)										// buildings
	        {
	            data[ i ] = 180;
	            data[ i + 1 ] = 0;
	            data[ i + 2 ] = 0;
	        }
	        else if (177 <= hsv[0] && hsv[0] <= 183 && 225 < gray && gray < 248)	// water
	        {
	            data[ i ] = 0;
	            data[ i + 1 ] = 255;
	            data[ i + 2 ] = 255;
	        }
	    }
	}
};
