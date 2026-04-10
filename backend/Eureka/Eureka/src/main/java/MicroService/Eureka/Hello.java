package MicroService.Eureka;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/hell")
public class Hello {
    
    @GetMapping
    public String hel(){
        return "Hello";
    }
}
