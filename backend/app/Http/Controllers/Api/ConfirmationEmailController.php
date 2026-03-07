<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EnrollmentConfirmationFormMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class ConfirmationEmailController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'course_id' => ['required', 'integer'],
            'group_id' => ['required', 'integer'],
            'course_title' => ['nullable', 'string', 'max:255'],
            'group_title' => ['nullable', 'string', 'max:255'],
            'monthly_amount' => ['nullable'],
            'duration_months' => ['nullable'],

            // Person
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'adresse' => ['nullable', 'string', 'max:1000'],
            'telephone_personnel' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'diplome_obtenu' => ['nullable', 'string', 'max:255'],
            'profession_exercee' => ['nullable', 'string', 'max:255'],

            // Enterprise section
            'entreprise' => ['nullable', 'string', 'max:255'],
            'is_entreprise' => ['nullable', 'boolean'],
            'bon_de_commande' => ['nullable', 'in:oui,non'],
            'adresse_facturation' => ['nullable', 'string', 'max:1000'],
            'contact_dossier' => ['nullable', 'string', 'max:255'],
            'telephone_contact' => ['nullable', 'string', 'max:50'],
            'email_contact' => ['nullable', 'email', 'max:255'],

            // Consent
            'accept_conditions' => ['required', 'boolean', 'in:1,true'],
        ]);

        $to = config('enrollment.confirmation_to', 'andalossi90@gmail.com');

        try {
            Mail::to($to)->send(new EnrollmentConfirmationFormMail($validated));

            return response()->json([
                'success' => true,
                'message' => 'Confirmation form sent successfully',
                'to' => $to,
                'mailer' => config('mail.default'),
            ]);
        } catch (TransportExceptionInterface $e) {
            // Typical SMTP issues: auth failed, cannot connect, SSL/TLS mismatch, blocked port.
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email (transport error).',
                'detail' => $e->getMessage(),
                'to' => $to,
                'mailer' => config('mail.default'),
            ], 500);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email.',
                'detail' => $e->getMessage(),
                'to' => $to,
                'mailer' => config('mail.default'),
            ], 500);
        }
    }

    /**
     * Dev-only endpoint to verify SMTP delivery without needing full payload.
     */
    public function test(Request $request): JsonResponse
    {
        $to = config('enrollment.confirmation_to', 'andalossi90@gmail.com');

        $payload = [
            'user_id' => 0,
            'course_id' => 0,
            'group_id' => 0,
            'course_title' => "TEST SMTP - " . (config('app.name') ?? 'App'),
            'group_title' => 'N/A',
            'monthly_amount' => null,
            'duration_months' => null,

            'nom' => 'Test',
            'prenom' => 'SMTP',
            'adresse' => null,
            'telephone_personnel' => null,
            'email' => 'no-reply@example.com',
            'diplome_obtenu' => null,
            'profession_exercee' => null,

            'is_entreprise' => false,
            'entreprise' => null,
            'bon_de_commande' => null,
            'adresse_facturation' => null,
            'contact_dossier' => null,
            'telephone_contact' => null,
            'email_contact' => null,

            'accept_conditions' => true,
        ];

        try {
            Mail::to($to)->send(new EnrollmentConfirmationFormMail($payload));

            return response()->json([
                'success' => true,
                'message' => 'Test email sent',
                'to' => $to,
                'mailer' => config('mail.default'),
            ]);
        } catch (TransportExceptionInterface $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email (transport error).',
                'detail' => $e->getMessage(),
                'to' => $to,
                'mailer' => config('mail.default'),
            ], 500);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send test email.',
                'detail' => $e->getMessage(),
                'to' => $to,
                'mailer' => config('mail.default'),
            ], 500);
        }
    }
}
