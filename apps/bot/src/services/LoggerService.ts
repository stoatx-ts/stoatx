import { Injectable } from "stoatx";

@Injectable()
export class LoggerService {
  log(message: string) {
    console.log(`[LOG SERVICE]: ${message}`);
  }
}
