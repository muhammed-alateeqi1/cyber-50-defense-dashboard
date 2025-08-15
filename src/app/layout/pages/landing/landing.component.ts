import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

declare var particlesJS: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, AfterViewInit {
  fullText: string = "We're on a mission to redefine the cybersecurity landscape with a focus on innovation, excellence, and unwavering commitment. Offering comprehensive next-gen solutions, alongside robust GRC capabilities, we deliver unparalleled cybersecurity services designed to safeguard your digital assets and operations with precision and excellence.";
  displayText: string = "";
  typingSpeed: number = 20;
  constructor(private _Router: Router) { }

  ngOnInit() { 

  this.typeWriter()
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initParticles();
    }, 500);
  }
  

  navigateToDashboard() {
    this._Router.navigate(['/dashboard']);
  }
  
  typeWriter(index: number = 0) {
    if (index < this.fullText.length) {
      this.displayText += this.fullText.charAt(index);
      setTimeout(() => this.typeWriter(index + 1), this.typingSpeed);
    }
  }

  private initParticles() {
    if (typeof particlesJS !== 'undefined') {
      console.log('Particles.js loaded successfully!');

      particlesJS('particles-js', {
        "particles": {
          "number": {
            "value": 120,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": ["#ffffff", "#3b82f6", "#8b5cf6", "#06b6d4"]
          },
          "shape": {
            "type": "circle"
          },
          "opacity": {
            "value": 1,
            "random": true,
            "anim": {
              "enable": true,
              "speed": 1,
              "opacity_min": 0.2,
              "sync": false
            }
          },
          "size": {
            "value": 2,
            "random": true,
            "anim": {
              "enable": true,
              "speed": 2,
              "size_min": 0.5,
              "sync": false
            }
          },
          "line_linked": {
            "enable": false
          },
          "move": {
            "enable": true,
            "speed": 1,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": {
              "enable": true,
              "mode": "bubble"
            },
            "onclick": {
              "enable": true,
              "mode": "repulse"
            },
            "resize": true
          },
          "modes": {
            "bubble": {
              "distance": 200,
              "size": 5,
              "duration": 2,
              "opacity": 0.8,
              "speed": 3
            },
            "repulse": {
              "distance": 150,
              "duration": 0.4
            }
          }
        },
        "retina_detect": true
      });

    } else {
      console.log('Particles.js not found, using static stars');
    }
  }
  
}