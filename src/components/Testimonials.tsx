import { Quote } from "lucide-react"

interface TestimonialProps {
  quote: string
  author: string
  role: string
  image: string
}

const testimonials: TestimonialProps[] = [
  {
    quote: "FoodFast delivers my lunch at work every day. The food is always hot and on time. Couldn't be happier!",
    author: "Sarah Johnson",
    role: "Marketing Professional",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    quote: "As a busy parent, FoodFast has been a lifesaver on those hectic evenings when cooking isn't an option.",
    author: "Michael Chen",
    role: "Software Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    quote: "The variety of restaurant choices is amazing. I've discovered so many great local spots through FoodFast!",
    author: "Alicia Rodriguez",
    role: "College Student",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop"
  }
]

export function Testimonials() {
  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-xl p-6 shadow-sm">
              <Quote className="text-primary h-8 w-8 mb-4 opacity-70" />
              <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}