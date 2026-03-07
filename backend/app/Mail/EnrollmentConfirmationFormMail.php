<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnrollmentConfirmationFormMail extends Mailable
{
    use Queueable, SerializesModels;

    /** @var array<string,mixed> */
    public array $payload;

    /**
     * @param array<string,mixed> $payload
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function build(): self
    {
        $courseTitle = $this->payload['course_title'] ?? null;
        $subject = $courseTitle
            ? "Demande d'inscription – {$courseTitle}"
            : "Demande d'inscription – Confirmation";

        $replyToEmail = $this->payload['email'] ?? null;
        $replyToName = trim((string) (($this->payload['prenom'] ?? '') . ' ' . ($this->payload['nom'] ?? '')));

        $this
            ->subject($subject)
            ->view('emails.enrollment_confirmation_form')
            ->text('emails.enrollment_confirmation_form_text')
            ->with([
                'p' => $this->payload,
            ]);

        // Best practice: reply goes to the user who filled the form.
        if (is_string($replyToEmail) && filter_var($replyToEmail, FILTER_VALIDATE_EMAIL)) {
            $this->replyTo($replyToEmail, $replyToName ?: null);
        }

        return $this;
    }
}
