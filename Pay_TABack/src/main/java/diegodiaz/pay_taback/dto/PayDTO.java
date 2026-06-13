package diegodiaz.pay_taback.dto;

import lombok.Data;
import java.util.Date;

@Data
public class PayDTO {
    private Long reservationId;
    private int price;
    private String format;
    private Date date;
}
