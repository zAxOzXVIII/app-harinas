#pragma once

/** Copia a `config.h` y ajusta valores. */

/** Grupo de rubro (debe existir en el backend). */
#define CODIGO_GRUPO "garbanzo-lenteja"

/** ID único de este secador / línea. */
#define DEVICE_ID "uno-secador-01"

/** Intervalo entre lecturas (ms). Mínimo recomendado: 15000. */
#define INTERVAL_MS 30000

/**
 * HC-05 por SoftwareSerial (no uses pin 0/1 si programas por USB).
 * HC-05 TXD -> Arduino pin BT_RX_PIN
 * HC-05 RXD -> Arduino pin BT_TX_PIN (con divisor 5V->3.3V)
 */
#define BT_RX_PIN 10
#define BT_TX_PIN 11
#define BT_BAUD 9600

/** 1 = envía JSON también por USB Serial (útil con gateway en PC por cable USB). */
#define MIRROR_USB_SERIAL 1
