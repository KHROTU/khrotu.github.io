---
title: The Making of a Cloud
date: '2026-08-30'
slug: the-making-of-a-cloud
---

How do you make a cloud?

If you know then great. Uh because I've got no clue.

No, I don't mean like actual clouds; what, are you some casual that goes outside? I meant how do you make realistic-looking, time-and-weather-dependent, procedurally generated clouds on the web that are also performant?

I still don't know.

Why I thought this was a good idea in the first place is unknown. The worst part is I was sober when I decided to do this, so I can't even blame it on alcohol.

What I do know is why I started in the first place. I was messing around with the "generative art" background in my Startpage, which is based on a simple flow field, and realised the lines looked an awful lot like shooting stars. So I thought to myself, "OK, let's make a background with shooting stars and a moon".

So I did that. I made a background with shooting stars and a moon. Behold, a background with shooting stars and a moon.

![background with shooting stars and a moon](/blogs/the-making-of-a-cloud/v1.webp)

"Oh. OK. That's a thing now.", I thought. Now what? Well, I know this might be groundbreaking for you, but you see, there's not only night time, there's also day time. And in the day time there is the sun. Which casts shadows on clouds. Shit.

And so we're back to the question at the beginning: how do you make a cloud?

But then I had a very good idea. I used DuckDuckGo. See, using DuckDuckGo gave me a whole new perspective and I was able to realise the best way to solve any programming problem is plagiarism.

So came the first iteration of the background. It was largely ~~copied from~~ inspired by the [three.js "sky" example](https://threejs.org/examples/?q=sky#webgl_shaders_sky) and [iq's "Clouds" shader](https://www.shadertoy.com/view/XslGRr), just converted to a Canvas-based implementation, with the distribution referenced from some weather thing that I forgot the name of.

![background v2](/blogs/the-making-of-a-cloud/v2.webp)

"Wow," I thought to myself, "this looks pretty cool". I realistically should have just stopped there, but no, you know what I thought, I thought it would be a great idea to try to make WebGL-based volumetric clouds. If you can't tell already, you don't let a chud like me try to make WebGL-based volumetric clouds.

![background v3](/blogs/the-making-of-a-cloud/v3.webp)

Now, from the image you may not be able to tell what's wrong with it. You might think to yourself, "Those sure are some clouds". But trust me, it had the noisiest fucking artefacts, lagged like super hell (and yes my browser is running on my iGPU and not my dGPU, but the Intel Arc Pro Graphics aren't completely useless), and was draining my battery like a succulent demon baby.

After which I promptly went back to the Canvas implementation with a few optimisations.

![background v4](/blogs/the-making-of-a-cloud/v4.webp)

So, what did we learn from this? I don't know. Did I learn anything other than stealing code and the fact that WebGL shaders are annoying as fuck? Probably not.

Yeah this was completely pointless and since I'm the only user of my Startpage, and I never turn this on, nobody uses it.

Yeah that's all.
